const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookies = require('cookie-parser');
const bodyParser = require("body-parser");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: "asd"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const getUserByEmail = function(email) {
  for (let id in users) {
    const user = users[id];
    if (user.email === email) {
      return user;
    }
  }
};

const getUsersURLs = function(userID) { //this is urlsForUser(id) but different function name
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    const url = urlDatabase[shortURL];
    if (url.userID === userID) {
      userURLs[shortURL] = url;
    }
  }
  return userURLs;
};

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookies());
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//------------------------------------------------------------------------------------

app.get('/login', (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password) {
    return res.status(400).send('Email or Password Cannot be blank');
  }
  
  const user = getUserByEmail(email);

  if (!user) {
    res.redirect('/register');
    return;
  }
  if (password !== user.password) {
    res.status(401).send('Incorrect Password');
    return;
  }

  res.cookie('user_id', user.id);
  res.redirect('/urls');

});

//------------------------------------------------------------------------------------

app.get('/loginerr', (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render('notLoggedIn', templateVars);
});

app.get('/urlerr', (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render('URLNotReal', templateVars);
});

//------------------------------------------------------------------------------------

app.get('/register', (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("accReg", templateVars);
});

app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password) {
    return res.status(400).send('Email or Password Cannot be blank');
  }
  
  if (getUserByEmail(email)) {
    return res.status(400).send('User already exists');
  }
  
  users[id] = {id, email, password}; // only adds to object after its been shown to not exist


  res.cookie('user_id', id);
  res.redirect('/urls');

});

//------------------------------------------------------------------------------------

app.get('/urls', (req, res) =>{
  const templateVars = {
    urls: getUsersURLs(req.cookies["user_id"]),
    user: users[req.cookies["user_id"]]
  };
  const userID = req.cookies['user_id'];
  const loggedIn = users[userID];
  
  if (!loggedIn) {
    res.redirect('/loginerr');
  }
  
  res.render("urlsIndex", templateVars);
});


app.post("/urls", (req, res) => { //changes are made on /url
  const userID = req.cookies['user_id'];
  const longURL = req.body.longURL;


  const randomURL = generateRandomString();
  urlDatabase[randomURL] = {longURL, userID};
  res.redirect(`/urls/${randomURL}`);
}); //creates new url

//------------------------------------------------------------------------------------

app.get("/urls/new", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedIn = users[userId];

  if (!loggedIn) {
    res.redirect('/loginerr');
  }
  
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

//------------------------------------------------------------------------------------

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies["user_id"]]
  };
  const userId = req.cookies['user_id'];
  const loggedIn = users[userId];

  if (!loggedIn) {
    res.redirect('/loginerr');
  }
  res.render("urlsShow", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.cookies['user_id'];
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = {longURL, userID};

  res.redirect(`/urls/${shortURL}`);
}); //edit existing URL

app.post('/urls/:shortURL/delete', (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedIn = users[userId];

  if (!loggedIn) {
     //cant make it so that delete doesnt happen when not logged in
  }

  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

//------------------------------------------------------------------------------------

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (!longURL) {
    return res.redirect('/urlerr'); // cant make it show HTML for non existent short URL
  }
  res.redirect(longURL);
}); //link redirect to longURL

//------------------------------------------------------------------------------------

app.post('/logout', (req, res) =>{
  res.clearCookie('user_id');
  res.redirect('/urls');
}); //log out, delete cookies, redirect

//------------------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = (length = 6) => Math.random().toString(20).substr(2, length);


