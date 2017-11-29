const event = require('./event');
const user = require('./user');
const projectUsers = require('./projectUsers');
const project = require('./project');
const auth = require('./auth');

// Required to avoid circular dep.
// We inject it into our app.js and bookshelf registry takes care of the rest
module.exports = {
  event,
  project,
  user,
  projectUsers,
  auth,
};
