const Event = require('../../models/event');

// curl http://localhost:8080/api/v1/events/cp-2018
const get = (req, res, next) => {
  const { slug } = req.params;
  return new Event({ slug }).fetch()
    .then(_event => res.status(200).json(_event))
    .catch(() => next(new Error('Error while searching for an event.')));
};

module.exports = {
  get,
};
