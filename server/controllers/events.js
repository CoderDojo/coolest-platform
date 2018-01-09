const Event = require('../models/event');

// curl http://localhost:8080/api/v1/events/cp-2018
const get = identifier =>
  new Event(identifier)
    .fetch();

module.exports = {
  get,
};
