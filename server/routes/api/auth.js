const authHandler = require('../../controllers/auth');

module.exports = (router, prefix) => {
  const base = `${prefix}/auth`;

  // Verify a token is valid
  router.post(`${base}/token`, async (req, res, next) =>
    authHandler
      .verify(req.body.token, 'basic')
      .then(auth => res.status(auth ? 204 : 401).send())
      .catch((e) => {
        req.app.locals.logger.error(e);
        const err = new Error('Invalid authentication');
        err.status = 401;
        next(err);
      }));
};
