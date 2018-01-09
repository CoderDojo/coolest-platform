const eventController = require('../../controllers/events');

module.exports = {
  get: [
    (req, res, next) =>
      eventController.get({ slug: req.params.slug })
        .then(_event => res.status(200).json(_event))
        .catch((err) => {
          req.app.locals.logger.error(err);
          return next(new Error('Error while searching for an event.'));
        }),
  ],
};
