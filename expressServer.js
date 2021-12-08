const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookies = require('cookie-parser');
const bodyParser = require("body-parser");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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



app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urlsIndex", templateVars);
});

app.post("/urls", (req, res) => { //new URL page command
  console.log(req.body);
  const randomURL = generateRandomString();
  urlDatabase[randomURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${randomURL}`);
});



app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});



app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urlsShow", templateVars);
});

app.post("/urls/:shortURL", (req, res) => { //edit existing URL
  console.log(req.body);
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});



app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});



app.post('/login', (req, res) =>{
  res.cookie('username',req.body.username);
  res.redirect('/urls');
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = (length = 6) => Math.random().toString(20).substr(2, length);

