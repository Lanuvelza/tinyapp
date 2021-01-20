const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser"); 

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

// generates a string of 6 random alphanumeric characters
function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x10000000).toString(36);
}

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
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render('urls_index', templateVars);
});

// must be above the route /urls/:id 
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {

  const shortURL = generateRandomString(); 
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`)

});

app.get("/urls/:shortURL", (req, res) => {
  
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL], 
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {

  urlDatabase[req.params.shortURL] = req.body.longURL; 
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {

  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  res.render("urls_login");
});


app.post("/login", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;

  if (getUserByEmail(email)) {
    const user = getUserByEmail(email); 
    
    if (user.password === password) {
      res.cookie('user_id', user.id);
      res.redirect("urls"); 
    }

    res.sendStatus(403);
  } 
  res.sendStatus(403);

});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("urls"); 
});

app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.post("/register", (req, res) => {

  const id = generateRandomString(); 
  const email = req.body.email; 
  const password = req.body.password; 

  if (email === "" || password === "" ) {
    res.sendStatus(400);
  } else if (getUserByEmail(email)) {
    res.sendStatus(400);
  } else {

    users[id] = {
      id, 
      email,
      password
    }; 
  
    res.cookie('user_id', id);
    res.redirect("urls");
  }

});


// Helper functions 


// retrieves the user object if the email exists in the user database
const getUserByEmail = function(email) {
  for (const user in users) {
    if (users[user].email === email) {

      return users[user]; 
    }
  }
}



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


