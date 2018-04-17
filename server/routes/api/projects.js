const handlers = require('../handlers/projects');
const passport = require('passport');
const acls = require('../authorisations/projects');

module.exports = (router, prefix) => {
  const base = `${prefix}/events/:eventId/projects`;
  acls.define(base, prefix);
  // Create
  router.post(base, passport.authenticate('jwt', { session: false }), acls.isAllowed, handlers.post);
  // Load
  router.get(`${base}/:id`, passport.authenticate('jwt', { session: false }), acls.isAllowed, handlers.get);
  // List
  router.get(base, passport.authenticate('jwt', { session: false }), acls.isAllowed, handlers.getAll);

  // Update
  router.patch(`${base}/:id`, passport.authenticate('jwt', { session: false }), acls.isAllowed, handlers.patch);
  // Update status
  router.patch(`${base}/:id/status`, (req, res, next) => { req.app.locals.public = true; return next(); }, acls.isAllowed, handlers.patchStatus);
  // Replace
  router.put(`${base}/:id`, passport.authenticate('jwt', { session: false }), acls.isAllowed, handlers.put);

  // Scoped requests
  router.get(`${prefix}/events/:eventId/users/:userId/projects`, passport.authenticate('jwt', { session: false }), acls.isAllowed, handlers.getUserProjects);

  router.param('eventId', handlers.eventParam);
  router.param('id', handlers.param);
};
