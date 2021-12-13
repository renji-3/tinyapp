const express = require('express');
const app = express();
const PORT = 8080;
// const cookies = require('cookie-parser');
const cookies = require('cookie-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const { getUserByEmail, getUsersURLs } = require('./helpers');

const urlDatabase = {
  b6UTxQ: {
    longURL: 'https://www.tsn.ca',
    userID: 'aJ48lW',
  },
  i3BoGr: {
    longURL: 'https://www.google.ca',
    userID: 'aJ48lW',
  },
};

const users = {
  aJ48lW: {
    id: 'aJ48lW',
    email: 'user@example.com',
    password: bcrypt.hashSync('asd', 10),
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: bcrypt.hashSync('qwe', 10),
  },
};

//-----------------------------EXTRA HELPER FUNCTION------------------------------------

const checkUser = (email, password) => {
  for (let user in users) {
    if (email === users[user].email) {
      if (bcrypt.compareSync(password, users[user].password)) {
        return user;
      }
    }
  }
  return null;
};

//-------------------------------EXTRA CONSTANTS-----------------------------------------------

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cookies({
    name: 'session',
    keys: ['I like potatoes, cheese and gravy', 'key'],
  })
);

app.set('view engine', 'ejs');

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

//-----------------------------REGISTRATION-----------------------------------------------------

app.get('/registersuccess', (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render('regSucc', templateVars);
}); //successful registration redirect page (does this instead of a redirect to /urls)

app.get('/register', (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render('accReg', templateVars);
}); //register page

app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send('Email or Password Cannot be blank');
  }

  if (getUserByEmail(email, users)) {
    return res.status(400).send('User already exists');
  }

  users[id] = { id: id, email: email, password: bcrypt.hashSync(password, 10) };

  req.session.user_id = users.id;
  res.redirect('/registersuccess');
}); //registration commands, no blanks, user exists, add to object/'database', create cookie

//---------------------------------LOGIN---------------------------------------------------

app.get('/login', (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render('login', templateVars);
}); //login page

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = checkUser(email, password);

  if (!email || !password) {
    return res.status(400).send('Email or Password Cannot be blank');
  }

  const user = getUserByEmail(email, users);

  if (!user) {
    res.redirect('/register');
    return;
  }
  if (!hashedPassword) {
    res.status(401).send('Incorrect Password');
    return;
  }

  req.session.user_id = user.id;
  res.redirect('/urls');
}); //login commands, if blank, if no user, if incorrect password

//-------------------------------URLS/HOME PAGE------------------------------------------------

app.get('/', (req, res) => {
  const userID = req.session.user_id;
  const loggedIn = users[userID];

  if (!loggedIn) {
    res.redirect('/login');
  }

  res.redirect('/urls');
}); //brings to URLs page

app.get('/urls', (req, res) => {
  const userID = req.session.user_id;
  const loggedIn = users[userID];

  if (!loggedIn) {
    res.redirect('/loginerr');
  }

  const templateVars = {
    urls: getUsersURLs(req.session.user_id, urlDatabase),
    user: users[req.session.user_id],
  }; //displays the URLs page

  res.render('urlsIndex', templateVars);
});

app.post('/urls', (req, res) => {
  const userID = req.session.user_id;
  const longURL = req.body.longURL;

  const randomURL = generateRandomString();
  urlDatabase[randomURL] = { longURL, userID };
  res.redirect(`/urls/${randomURL}`);
}); //actually creates the new URL

//-------------------------------NEW URL CREATION PAGE------------------------------------------------

app.get('/urls/new', (req, res) => {
  const userId = req.session.user_id;
  const loggedIn = users[userId];

  if (!loggedIn) {
    res.redirect('/login');
  }

  const templateVars = { user: users[req.session.user_id] };
  res.render('urls_new', templateVars);
}); //displays the new URL page

//------------------------------ACCESSING URLS-------------------------------------------------

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id],
  };
  const userId = req.session.user_id;
  const loggedIn = users[userId];

  if (!loggedIn) {
    res.redirect('/loginerr'); //if not logged in go to error page
  }
  
  if (urlDatabase[templateVars.shortURL].userID !== templateVars.user.id) {
    res.send(`Error: Whose mans is this bro??? You don't own the URL BUCKTEE, BACKOFF!`);
  }

  res.render('urlsShow', templateVars);
}); //view shortened URL page

app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = { longURL, userID };

  res.redirect(`/urls/${shortURL}`);
}); //edit existing short URL

app.post('/urls/:shortURL/delete', (req, res) => {
  const userId = req.session.user_id;
  const loggedIn = users[userId];

  if (!loggedIn) {
    return res.redirect('/loginerr');
  }

  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
}); //deleting shortened URL

//-----------------------------URL REDIRECT-------------------------------------------------------

app.get('/u/:shortURL', (req, res) => {
  const shortURL = urlDatabase[req.params.shortURL];
  if (!shortURL) {
    return res.redirect('/urlerr');
  }
  res.redirect(shortURL.longURL);
}); //redirect to long URL

//-------------------------------LOG OUT-----------------------------------------------------

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
}); //log out, delete cookies, redirect

//------------------------------ERROR REDIRECTS---------------------------------------------------

app.get('/loginerr', (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render('notLoggedIn', templateVars);
}); //login error page

app.get('/urlerr', (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render('URLNotReal', templateVars);
}); //url doesnt exist error page

//------------------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = (length = 6) =>
  Math.random().toString(20).substr(2, length);
