function disallowed(next) {
  const forbidden = new Error('Forbidden');
  forbidden.status = 403;
  return next(forbidden);
}

module.exports.isAllowed = acl => (req, res, next) => {
  const role = [req.user ? req.user.role : 'guest'];
  acl.areAnyRolesAllowed(role, req.route.path, req.method.toLowerCase(), (err, allowed) => {
    if (err) return next(err);
    if (!allowed) return disallowed(next);
    next();
  });
};

module.exports.disallowed = disallowed;
