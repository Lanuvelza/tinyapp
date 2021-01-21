// Helper functions

// retrieves the user object if the email exists in the user database
const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (database[user].email === email) {

      return users[user];
    }
  }
};

// returns the database of URLs where the given userID
// is equal to the id of the currently logged user
const urlsForUser = function(id) {

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
  getUserByEmail,
  urlsForUser
}; 