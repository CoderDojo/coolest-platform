const Acl = require('acl');
const utils = require('./utils');
// Using the memory backend
// eslint-disable-next-line new-cap
const acl = new Acl(new Acl.memoryBackend());

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
    if ((req.app.locals.project && req.app.locals.project.isOwner(req.user.userId)) || req.user.role === 'admin') {
      return next();
    }
    return utils.disallowed(next);
  }
  return utils.isAllowed(acl)(req, res, next);
};
