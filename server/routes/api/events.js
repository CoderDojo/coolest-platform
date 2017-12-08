const eventHandler = require('../../controllers/events');

module.exports = (router, prefix) => {
  const base = `${prefix}/events`;

  // Load an event by slug
  router.get(`${base}/:slug`, eventHandler.get);
};
