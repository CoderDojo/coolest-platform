const handlers = require('../../handlers/events');
const passport = require('passport');
const acls = require('../../authorisations/admin/events');

module.exports = (router, prefix) => {
  const base = `${prefix}/events`;
  acls.define(base);

  router.post(`${base}/:eventId/emails/confirmAttendance`, passport.authenticate('jwt', { session: false }), acls.isAllowed, handlers.sendConfirmAttendanceEmail);

  // TODO : externalise if we have more than one
  router.post(`${base}/:eventId/seats`, passport.authenticate('jwt', { session: false }), acls.isAllowed, handlers.generateSeating);
};
