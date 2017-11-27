const authHandler = require('../handlers/auth');
module.exports = (router, prefix) => {
  const base = `${prefix}/auth`;

  // Verify a token is valid
  router.get(base, authHandler.get)
}
