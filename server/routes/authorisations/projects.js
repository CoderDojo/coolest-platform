const Acl = require('acl');
const utils = require('./utils');
// Using the memory backend
// eslint-disable-next-line new-cap
const acl = new Acl(new Acl.memoryBackend());

// Edition is available while the event isn't frozen
const canEdit =
  (req) => { return req.params.id && ['put', 'patch'].includes(req.method.toLowerCase()) ? !req.app.locals.event.isFrozen() : true; };
// Creation is available while the event isn't frozen
const canCreate =
  (req) => { return req.method.toLowerCase() === 'post' ? req.app.locals.event.isOpen() : true; };

module.exports.define = (apiPrefix, originalPrefix) => {
  acl.allow([
    {
      roles: ['basic'],
      allows: [{
        resources: `${apiPrefix}`,
        permissions: ['post'],
      }],
    },
    {
      roles: ['admin'],
      allows: [{
        resources: `${apiPrefix}`,
        permissions: ['get'],
      }],
    },
    {
      roles: ['basic', 'admin'],
      allows: [{
        resources: `${apiPrefix}/:id`,
        permissions: ['get', 'patch', 'put'],
      }],
    },
    {
      roles: [],
      allows: [{
        resources: `${apiPrefix}/:id/status`,
        permissions: ['patch'],
      }],
    },
    {
      roles: ['basic'],
      allows: [{
        resources: `${originalPrefix}/events/:eventId/users/:userId/projects`,
        permissions: ['get'],
      }],
    },
  ]);
};

module.exports.isAllowed = (req, res, next) => {
  if (req.params.id) {
    if (
      (req.app.locals.project &&
        (req.app.locals.public || req.app.locals.project.isOwner(req.user.userId)) &&
        canEdit(req)) ||
      (req.user ? req.user.role === 'admin' : false)) {
      return next();
    }
    return utils.disallowed(next);
  }
  if (canCreate(req)) {
    return utils.isAllowed(acl)(req, res, next);
  }
  return utils.disallowed(next);
};
