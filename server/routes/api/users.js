const handlers = require('../handlers/users');
const passport = require('passport');
const acls = require('../authorisations/users');

module.exports = (router, prefix) => {
  const base = `${prefix}/users`;
  acls.define(base, prefix);

  // Create a new user
  router.post(base, handlers.post);

  // List
  router.get(base, passport.authenticate('jwt', { session: false }), acls.isAllowed, handlers.getAll);
};
