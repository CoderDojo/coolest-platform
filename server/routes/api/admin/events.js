const eventHandler = require('../../handlers/events');
const passport = require('passport');
const acls = require('../../authorisations/admin/events');

module.exports = (router, prefix) => {
  const base = `${prefix}/events`;
  acls.define(base);

  router.post(`${base}/:eventId/emails/confirmAttendance`, passport.authenticate('jwt', { session: false }), acls.isAllowed, eventHandler.sendConfirmAttendanceEmail);
};
