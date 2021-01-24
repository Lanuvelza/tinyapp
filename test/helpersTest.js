const { assert } = require('chai');

const { generateRandomString, getUserByEmail, urlsForUser, addNewVisitor, addNewLog } = require('../helpers.js');

describe('generateRandomString', function() {
  it('should return strings of 6 characters.', function() {
    const expectedLength = 6;
    assert.strictEqual(generateRandomString().length, expectedLength);
  });
});

const testUsers = {
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
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.strictEqual(user.id, expectedOutput);
  });

  it('should return undefined with an invalid email', function() {
    const user = getUserByEmail("hello@example.com", testUsers);
    assert.isUndefined(user, undefined);
  });

  it('should return undefined with an empty string', function() {
    const user = getUserByEmail("", testUsers);
    assert.isUndefined(user, undefined);
  });

  it('should return undefined with an empty database', function() {
    const user = getUserByEmail("user@example.com", {});
    assert.isUndefined(user, undefined);
  });
});

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" },
  "b6UTxQ": { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  "i3BoGr": { longURL: "https://www.youtube.com", userID: "aJ48lW" }
};

describe('urlsForUser', function() {
  it('should return a list of urls given an valid id', function() {
    const user = urlsForUser("aJ48lW", urlDatabase);
    const expectedOutput = {
      "b6UTxQ": { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
      "i3BoGr": { longURL: "https://www.youtube.com", userID: "aJ48lW" }
    };
    assert.deepEqual(user, expectedOutput);
  });

  it('should return an empty object given an invalid id', function() {
    const user = urlsForUser("hello", urlDatabase);
    const expectedOutput = {};
    assert.deepEqual(user, expectedOutput);
  });

  it('should return an empty object given an empty string', function() {
    const user = urlsForUser("", urlDatabase);
    const expectedOutput = {};
    assert.deepEqual(user, expectedOutput);
  });

  it('should return an empty object given an empty database', function() {
    const user = urlsForUser("aJ48lW", {});
    const expectedOutput = {};
    assert.deepEqual(user, expectedOutput);
  });
  
});

describe('addNewVisitor', function() {
  it('should add a new user if the user does not exist', function() {
    const visitor = ["a", "b", "c"];
    addNewVisitor("d", visitor);
    expectedOutput = ["a", "b", "c", "d"];
    assert.deepEqual(visitor, expectedOutput);
  });

  it('should not add a new user if the user does exist', function() {
    const visitor = ["a", "b", "c"];
    addNewVisitor("b", visitor);
    expectedOutput = ["a", "b", "c"];
    assert.deepEqual(visitor, expectedOutput);
  });
});

describe('addNewLog', function() {
  it('should add a new log to the visitorlog', function() {
    const visitorLog = [
      { id: "abc", date: "2021-01-23T21:42:44.583Z" },
      { id: "efg", date: "2021-01-23T21:58:41.431Z" }
    ];
    addNewLog("123", visitorLog);
    assert.strictEqual(visitorLog[0].id, "abc");
    assert.strictEqual(visitorLog[1].id, "efg");
    assert.strictEqual(visitorLog[2].id, "123");
    addNewLog("abc", visitorLog);
    assert.strictEqual(visitorLog[3].id, "abc");
  });
});