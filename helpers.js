const getUserByEmail = function(email, database) {
  for (let id in database) {
    const user = database[id];
    if (user.email === email) {
      return user;
    }
  }
};

const getUsersURLs = function(userID, database) { //this is urlsForUser(id) but different function name
  const userURLs = {};
  for (const shortURL in database) {
    const url = database[shortURL];
    if (url.userID === userID) {
      userURLs[shortURL] = url;
    }
  }
  return userURLs;
};

module.exports = { getUserByEmail, getUsersURLs };