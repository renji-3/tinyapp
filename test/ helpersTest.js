const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

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
    const expectedUserID = "userRandomID";

    assert.equal(expectedUserID, user.id);
  });
});

describe('getUserByEmail', function() {
  it('should not return a user with an invalid email', function() {
    const user = getUserByEmail("gah@gah.ca", testUsers);
    const expectedUserID = undefined;

    assert.equal(expectedUserID, user);
  });
});