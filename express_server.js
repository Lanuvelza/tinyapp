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



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

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

// if user is logged in, displays a list of URLs the user has created 
// if user is not logged in, return an error indicating that the user is not logged in
app.get("/urls", (req, res) => {

  const user = users[req.cookies["user_id"]]; 
  const urls = urlsForUser(req.cookies["user_id"]);

  if (!user) {
    const templateVars = { user }; 
    res.render("urls_404", templateVars); 
  } else {

    const templateVars = {
      urls,
      user
    };
    
    res.render('urls_index', templateVars);
  }
});

// must be above the route /urls/:id
// if user is logged in, displays a form which the user can create a new shortURL given an long original URL in the input text
// if user is not logged in, redirects to the login page
app.get("/urls/new", (req, res) => {

  const user = users[req.cookies["user_id"]];

  if (!user) {
    res.redirect("/login");
  } else {

    const templateVars = { user };
    res.render("urls_new", templateVars);
    
  }
});

// if user is logged in and owns the URL for the given ID, displays the page where it shows the information of the shortURL for a given ID, 
// if the user is not logged in, returns an error message saying user not logged in
// if a URL for a given ID does not exist, return a 404 error message 
// if the URL ID does not match the user Id, return a 403 error message
app.get("/urls/:shortURL", (req, res) => {

  const user = users[req.cookies["user_id"]];
  const shortURL = req.params.shortURL; 
  
  if (!user) {
    const templateVars = { user }; 
    res.render("urls_404", templateVars); 
  } else if (!urlDatabase[shortURL]) {
    res.sendStatus(404);
  } else if (urlDatabase[shortURL].userID !== user.id) {
    res.sendStatus(403);
  } else {

    const longURL = urlDatabase[shortURL].longURL; 
    
    const templateVars = {
      shortURL,
      longURL,
      user
    };
  
    res.render("urls_show", templateVars);
  }
  
});

// if user for the given ID exists, redirects to the corresponding long URL
// if URL for the given ID does not exist, return a 404 error message 
app.get("/u/:shortURL", (req, res) => {

  const shortURL = req.params.shortURL;
  
  if (!urlDatabase[shortURL]) {
    res.sendStatus(404);
  } else {

    const longURL = urlDatabase[shortURL].longURL;

    res.redirect(longURL);
  }

});


// adds the new URL to the list of URLs the user has created and redirects to page of urls/:id where :id matches the ID of the newly save URL
// if user is not logged in, return an error indicating the user is not logged in
app.post("/urls", (req, res) => {

  const user = users[req.cookies["user_id"]];
  // generates a new ID for the shortURL
  const shortURL = generateRandomString();
  // assigns the longURL to the inputted longURL
  const longURL = req.body.longURL;
  // assigns the logged user ID to the user ID of the shortURL
  const userID = user.id; 
  
  if (!user) {
    const templateVars = { user }; 
    res.render("urls_404", templateVars); 
  } else {
    // adds the new shortURL onto the database
    urlDatabase[shortURL] = {
      longURL,
      userID
    };
    res.redirect(`/urls/${shortURL}`);
  }

});

// if user is logged in and owns the URL for the given ID, updates the URL and redirects to /urls page
// if user is not logged in, return an error message indicating that the user is not logged in
// if user is logged in but does not own the URL for the given ID, return a 403 error message  
app.post("/urls/:shortURL", (req, res) => {

  const user = users[req.cookies["user_id"]]; 
  const shortURL = req.params.shortURL;

  if (!user) {
    const templateVars = { user }; 
    res.render("urls_404", templateVars); 
  } else if (urlDatabase[shortURL].userID !== user.id) {
    res.sendStatus(403);
  } else {

    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  }

});

// if user is logged and owns the URL for the given ID, delete the URL and redirect back to /urls page
// if user is not logged in, return an error indicating that the user is not logged in
// if user is logged in but does not own the URL for the given ID, returns a 403 error message 
app.post("/urls/:shortURL/delete", (req, res) => {

  const user = users[req.cookies["user_id"]];
  const shortURL = req.params.shortURL;

  if (!user) {
    const templateVars = { user }; 
    res.render("urls_404", templateVars); 
  } else if (urlDatabase[shortURL].userID !== user.id) {
    res.sendStatus(403);
  } else {

    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }

});


// if user is logged in, redirect to /urls page
// if user is not logged in, displays the login form page where the user inputs an email and password
app.get("/login", (req, res) => {

  const user = users[req.cookies["user_id"]];

  if(!user) {
    res.render("urls_login");
  } else {
    res.redirect("/urls");
  }

});


// if user is logged in, redirect to /urls page
// if user is not logged in, displays the register form page where the user inputs an email and password to register
app.get("/register", (req, res) => {

  const user = users[req.cookies["user_id"]]; 
  
  if(!user) {
    res.render("urls_register");
  } else {
    res.redirect("/urls")
  }
});

// if email and password match an existing user, immediately sets the user ID as a cookie and redirects to /urls page
// if email and password params do not match exisitng user, return a 403 error message 
// checks passwords using bycrpt 
app.post("/login", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;

  if (!getUserByEmail(email)) {
    res.sendStatus(403);

  } else if (!bcrypt.compareSync(password, getUserByEmail(email).password)) {
    res.sendStatus(403);
  
  } else {
    res.cookie('user_id', getUserByEmail(email).id);
    res.redirect("urls");
  }

});

// creates and registers a new user in user database, assigns registered user ID to a cookie and redirects user to /urls page 
// if submitted email or password is empty, returns 400 error message 
// if email already exists in user database, return 400 error message 
app.post("/register", (req, res) => {

  // generates a new ID for the user
  const id = generateRandomString();
  const email = req.body.email;
  // encrypts new user's password with bcrypt 
  const password = bcrypt.hashSync(req.body.password, 10);

  if (email === "" || password === "") {
    res.sendStatus(400);
  } else if (getUserByEmail(email)) {
    res.sendStatus(400);
  } else {

    // adds user's registered information onto the user database
    // adds the user's encrypted password onto the database
    users[id] = {
      id,
      email,
      password
    };
  
    res.cookie('user_id', id);
    res.redirect("/urls");
  }

});

// logs the user out and clears the cookie
// redirects user back to /urls page
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

// catches a request to any other pages and return 404 error message
app.get("*", (req, res) => {
  res.sendStatus(404);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
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





