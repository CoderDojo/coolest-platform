const handlers = require('../handlers/events');
const acls = require('../authorisations/events');
const passport = require('passport');

module.exports = (router, prefix) => {
  const base = `${prefix}/events`;
  acls.define(base);
  // Load an event by slug
  router.get(`${base}/:slug`, acls.isAllowed, handlers.get);

  // TODO : externalise if we have more than one
  router.post(`${base}/:eventId/seats`, passport.authenticate('jwt', { session: false }), acls.isAllowed, handlers.generateSeating);
};
