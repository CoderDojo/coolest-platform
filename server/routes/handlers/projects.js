const projectController = require('../../controllers/projects');
const passport = require('passport');

module.exports = {
  post: [
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
      return projectController.post(req.body, req.params.eventId)
        .then((project) => {
          res.locals.project = project;
          return next();
        })
        .catch((err) => {
          req.app.locals.logger.error(err);
          return next(new Error('Error while saving your project.'));
        });
    },
    (req, res, next) => {
      return req.app.locals.mailing.sendWelcomeEmail(res.locals.project)
        .then(() => next())
        .catch(next);
    },
    (req, res) => res.status(200).json(res.locals.project),
  ],
};
