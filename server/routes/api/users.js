const usersHandler = require('../handlers/users');

module.exports = (router, prefix) => {
  const base = `${prefix}/users`;

  // Create a new user
  router.post(base, usersHandler.post);
};
