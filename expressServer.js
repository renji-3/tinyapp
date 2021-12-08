const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookies = require('cookie-parser');
const bodyParser = require("body-parser");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userDatabase = {

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

app.get('/register', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("accReg", templateVars);
});

app.post('/register', (req, res) => {
  const user = req.body.username;
  userDatabase[user] = req.body.username;
  res.redirect("/urls");
});


//------------------------------------------------------------------------------------

//get is a page loader, post is a command (rough explanation)

app.get('/urls', (req, res) =>{ //accesses the page ending in /urls
  const templateVars = { //gives necessary values
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urlsIndex", templateVars); //renders the file urlsIndex
});


app.post("/urls", (req, res) => { //changes are made on /url
  console.log(req.body); //to console
  const randomURL = generateRandomString(); //generate randomm string
  urlDatabase[randomURL] = req.body.longURL; //assign string to the requested (by client) body (of submission) longURL (assigned variable - cant think of where its assigned)
  console.log(urlDatabase); //log to console
  res.redirect(`/urls/${randomURL}`); //redirect back to urls/randomURL
}); //creates new url

//------------------------------------------------------------------------------------

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

//------------------------------------------------------------------------------------

app.get("/urls/:shortURL", (req, res) => { //: is the parameter/variable describer for js links
  const templateVars = { //necessary info
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render("urlsShow", templateVars); //render from urlsShow
});

app.post("/urls/:shortURL", (req, res) => {
  console.log(req.body);
  const shortURL = req.params.shortURL; //shortURL is the same as in the URL above
  urlDatabase[shortURL] = req.body.longURL; //change shortURL value in Database to new requested longURL(variable assigned elsewhere - not sure exactly where)
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`); //redirect to home
}); //edit existing URL

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
}); //when delete is pressed, take us to the assigned URL delete page,immediately redirect to home page

//------------------------------------------------------------------------------------

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
}); //link redirect to longURL

//------------------------------------------------------------------------------------

app.post('/login', (req, res) =>{
  res.cookie('username',req.body.username);
  res.redirect('/urls');
}); //log in, save cookies, redirect

app.post('/logout', (req, res) =>{
  res.clearCookie('username', req.body.username);
  res.redirect('/urls');
}); //log out, delete cookies, redirect

//------------------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = (length = 6) => Math.random().toString(20).substr(2, length);

