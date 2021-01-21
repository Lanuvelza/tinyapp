// Helper functions

// generates a string of 6 random alphanumeric characters
const generateRandomString = function() {
  return Math.floor((1 + Math.random()) * 0x10000000).toString(36);
};

// retrieves the user object if the email exists in the user database
const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (database[user].email === email) {

      return database[user];
    }
  }
};

// returns the database of URLs where the given userID
// is equal to the id of the currently logged user
const urlsForUser = function(id, urlDatabase) {

  const database = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      let userurl = urlDatabase[url];
      database[url] = userurl;
    }
  }
  return database;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUser
};