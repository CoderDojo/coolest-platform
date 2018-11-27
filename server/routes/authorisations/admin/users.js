const Acl = require('acl');
const utils = require('../utils');
// Using the memory backend
// eslint-disable-next-line new-cap
const acl = new Acl(new Acl.memoryBackend());

module.exports.define = (apiPrefix) => {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: `${apiPrefix}`,
      permissions: ['post'],
    }],
  }]);
};

module.exports.isAllowed = (req, res, next) => {
  if (req.user.user.email !== process.env.MASTER_ADMIN_EMAIL) {
    return utils.disallowed(next); 
  }
  return utils.isAllowed(acl)(req, res, next);
};
