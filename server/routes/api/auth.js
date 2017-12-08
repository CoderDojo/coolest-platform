const authHandler = require('../../controllers/auth');

module.exports = (router, prefix) => {
  const base = `${prefix}/auth`;

  // Verify a token is valid
  router.get(`${base}/:token`, async (req, res, next) => {
    authHandler.verify(req.params.token)
      .then((auth) => {
        return res.json({ valid: auth });
      })
      .catch(e => next(new Error('Invalid authentication')));
  });
};
