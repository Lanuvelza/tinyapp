const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" },
  "b6UTxQ": { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  "i3BoGr": { longURL: "https://www.youtube.com", userID: "aJ48lW" }
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
  },
  "aJ48lW": {
    id: "aJ48lW",
    email: "user3@example.com",
    password: "hello"
  }
};

// generates a string of 6 random alphanumeric characters
const generateRandomString = function() {
  return Math.floor((1 + Math.random()) * 0x10000000).toString(36);
};

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
    urls: urlsForUser(req.cookies["user_id"]),
    user: users[req.cookies["user_id"]]
  };

  res.render('urls_index', templateVars);
});

// must be above the route /urls/:id
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];

  if (!user) {
    res.redirect("/login");
  } else {

    const templateVars = {
      user
    };

    res.render("urls_new", templateVars);
    
  }
});

app.post("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  
  if (!user) {
    res.sendStatus(403); 
  } else {
    
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    const userID = user.id; 


    urlDatabase[shortURL] = {
      longURL,
      userID
    };
    res.redirect(`/urls/${shortURL}`);
  }

});

app.get("/urls/:shortURL", (req, res) => {

  if (!urlDatabase[req.params.shortURL]) {
    res.sendStatus(404);
  } else {

    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.cookies["user_id"]]
    };
  
    res.render("urls_show", templateVars);
  }
  
});

app.post("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies["user_id"]]; 

  if (!user) {
    res.sendStatus(403); 
  } else if (!urlDatabase[req.params.shortURL]) {
    res.sendStatus(404);
  } else if (urlDatabase[req.params.shortURL].userID !== user.id) {
    res.sendStatus(403);
  } else {

    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  }

});

app.post("/urls/:shortURL/delete", (req, res) => {
  const user = users[req.cookies["user_id"]];

  if (!user) {
    res.sendStatus(403);
  } else if (!urlDatabase[req.params.shortURL]) {
    res.sendStatus(404);
  } else if (urlDatabase[req.params.shortURL].userID !== user.id) {
    res.sendStatus(403);
  } else {
    
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }

});

app.get("/u/:shortURL", (req, res) => {

  if (!urlDatabase[req.params.shortURL]) {
    res.sendStatus(404); 
  } else {

    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }

});

app.get("/login", (req, res) => {
  res.render("urls_login");
});


app.post("/login", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;

  if (!getUserByEmail(email)) {
    res.sendStatus(403);

  } else if (getUserByEmail(email).password !== password) {
    res.sendStatus(403);
  
  } else {
    res.cookie('user_id', getUserByEmail(email).id);
    res.redirect("urls");
  }

});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.post("/register", (req, res) => {

  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (email === "" || password === "") {
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
    res.redirect("/urls");
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
};

// returns the database of URLs where the given userID 
// is equal to the id of the currently logged user 
const urlsForUser = function(id) {
  const database = {}
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      let userurl = urlDatabase[url];
      database[url] = userurl; 
    }
  }
  return database; 
}


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


