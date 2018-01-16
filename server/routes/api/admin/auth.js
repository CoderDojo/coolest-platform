const authHandler = require('../../../controllers/auth');
const passport = require('passport');

module.exports = (router, prefix) => {
  const base = `${prefix}/auth`;

  // Verify an admin token is valid
  router.post(`${base}/token`, async (req, res, next) =>
    authHandler
      .verify(req.body.token, 'admin')
      .then(auth => res.status(auth ? 204 : 401).send())
      .catch((e) => {
        req.app.locals.logger.error(e);
        const err = new Error('Invalid authentication');
        err.status = 401;
        next(err);
      }));

  // Admin Login
  router.post(
    `${base}`, passport.authenticate('local', { session: false }),
    (req, res, next) => {
      if (req.user) return res.status(200).json(req.user);
      return next();
    },
  );
};
