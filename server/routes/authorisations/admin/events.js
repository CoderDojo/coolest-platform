const Acl = require('acl');
const utils = require('../utils');
// Using the memory backend
// eslint-disable-next-line new-cap
const acl = new Acl(new Acl.memoryBackend());

module.exports.define = (apiPrefix) => {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: `${apiPrefix}/:eventId/emails/confirmAttendance`,
      permissions: ['post'],
    }],
  },
  ]);
};

module.exports.isAllowed = (req, res, next) =>
  utils.isAllowed(acl)(req, res, next);
