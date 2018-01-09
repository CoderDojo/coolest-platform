const eventHandler = require('../handlers/events');
const acls = require('../authorisations/events');

module.exports = (router, prefix) => {
  const base = `${prefix}/events`;
  acls.define(base);
  // Load an event by slug
  router.get(`${base}/:slug`, acls.isAllowed, eventHandler.get);
};
