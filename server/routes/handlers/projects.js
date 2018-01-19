const projectController = require('../../controllers/projects');

module.exports = {
  post: [
    (req, res, next) =>
      projectController
        .post(req.user.user, req.body, req.params.eventId)
        .then((project) => {
          res.locals.project = project;
          return next();
        })
        .catch((err) => {
          req.app.locals.logger.error(err);
          return next(new Error('Error while saving your project.'));
        }),
    (req, res, next) =>
      req.app.locals.mailing
        .sendWelcomeEmail(req.user.user, res.locals.project)
        .then(() => next())
        .catch(next),
    (req, res) => res.status(200).json(res.locals.project),
  ],

  get: [
    (req, res) => res.status(200).json(req.app.locals.project),
  ],

  patch: [
    (req, res, next) =>
      projectController
        // Save by ensuring the payload contains the proper id
        .update(req.app.locals.project, Object.assign({}, req.body, { id: req.params.id }))
        .then((project) => {
          res.locals.project = project;
          return next();
        })
        .catch((err) => {
          req.app.locals.logger.error(err);
          return next(new Error('Error while saving your project.'));
        }),
    (req, res) => res.status(200).json(res.locals.project),
  ],

  getAll: [
    (req, res) =>
      projectController
        .getByEvent(req.params.eventId, req.query)
        .then((projects) => {
          res.status(200).json({
            data: projects.models,
            count: projects.pagination.rowCount,
          });
        }),
  ],

  param: (req, res, next, id) =>
    projectController
      .get({ id }, ['owner'])
      .then((param) => {
        req.app.locals.project = param;
        next();
      }),
};
