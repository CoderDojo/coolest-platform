const handlers = require('../../handlers/users');
const passport = require('passport');
const acls = require('../../authorisations/admin/users');

module.exports = (router, prefix) => {
  const base = `${prefix}/users`;
  acls.define(base, prefix);

  // Create a new user
  router.post(
    base,
    passport.authenticate('jwt', { session: false }),
    acls.isAllowed,
    handlers.postAdmin,
  );
};
