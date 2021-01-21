const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');

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

// if user is logged in, redirect to /urls 
// if user is not logged in, redirect to /login
app.get("/", (req, res) => {
  const user = users[req.cookies["user_id"]]; 
  if(!user) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// if user is logged in, displays a list of URLs the user has created 
// if user is not logged in, return an error indicating that the user is not logged in
app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]]; 

  if (!user) {
    res.status(403).send("User not logged in");
  } else {

    const templateVars = {
      urls: urlsForUser(req.cookies["user_id"]),
      user
    };
    
    res.render('urls_index', templateVars);
  }
});


// adds the new URL to the list of URLs the user has created and redirects to page of urls/:id where :id matches the ID of the newly save URL
// if user is not logged in, return an error indicating the user is not logged in
app.post("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  
  if (!user) {
    res.status(403).send("User not logged in"); 
  } else {
    
    // generates a new ID for the shortURL
    const shortURL = generateRandomString();
    // assigns the longURL to the inputted longURL
    const longURL = req.body.longURL;
    // assigns the logged user ID to the user ID of the shortURL
    const userID = user.id; 

    // adds the new shortURL onto the database
    urlDatabase[shortURL] = {
      longURL,
      userID
    };

    res.redirect(`/urls/${shortURL}`);
  }

});


// must be above the route /urls/:id
// if user is not logged in, displays a form which the user can create a new shortURL given an long original URL in the input text
// if user is not logged in, redirects to the login page
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

// if user is logged in and owns the URL for the given ID, displays the page where it shows the information of the shortURL for a given ID, 
// if the user is not logged in, returns an error message saying user not logged in
// if a URL for a given ID does not exist, return an error message indicating the the Short URL does not exist
// if the URL ID does not match the user Id, return an error message indicating that the user is the incorrect user of that short URL ID
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies["user_id"]];

  if (!user) {
    res.status(403).send("User not logged in");
  } else if (!urlDatabase[req.params.shortURL]) {
    res.status(404).send("Short URL does not exist"); 
  } else if (urlDatabase[req.params.shortURL].userID !== user.id) {
    res.status(403).send("Incorrect user of short URL ID"); 
  } else {

    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user
    };
  
    res.render("urls_show", templateVars);
  }
  
});

// if user for the given ID exists, redirects to the corresponding long URL
// if URL for the given ID does not exist, return an error message indidcating the short URL does not exist
app.get("/u/:shortURL", (req, res) => {

  if (!urlDatabase[req.params.shortURL]) {
    res.status(404).send("Short URL does not exist") 
  } else {

    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
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
  const hashedPassword = bcrypt.hashSync(password, 10)

  if (email === "" || password === "") {
    res.sendStatus(400);
  } else if (getUserByEmail(email)) {
    res.sendStatus(400);
  } else {

    users[id] = {
      id,
      email,
      password: hashedPassword
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


