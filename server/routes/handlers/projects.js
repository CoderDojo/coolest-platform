const projectController = require('../../controllers/projects');
const json2csv = require('json2csv');

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
    (req, res) => {
      const paginated = !(req.query.format && req.query.format === 'csv');
      req.query.query = req.query.query || {};
      req.query.query.event_id = req.params.eventId;
      return projectController
        .getExtended(req.query, paginated)
        .then((projects) => {
          const dateFormat = date => new Date(date).toLocaleDateString();
          if (!paginated) {
            res.setHeader('Content-Type', 'text/csv');
            const data = projects.toJSON();
            const fields = [
              { label: 'Name', value: 'name' },
              { label: 'Description', value: 'description' },
              { label: 'Category', value: 'category' },
              { label: 'Supervisor Email', value: 'supervisor.email' },
              { label: 'Owner Email', value: 'owner.email' },
              { label: 'Created At', value: row => dateFormat(row.createdAt) },
              { label: 'Updated At', value: row => dateFormat(row.updatedAt) },
            ];
            return res.status(200).send(json2csv({
              data,
              fields,
            }));
          }
          return res.status(200).json({
            data: projects.models,
            count: projects.pagination.rowCount,
          });
        });
    },
  ],

  getUserProjects: [
    // This is fairly lazy solution. Optimaly, the project_users relation should be loaded
    // with their projects
    (req, res) => {
      const query = { 'owner.id': req.user.userId, event_id: req.params.eventId };
      return projectController.getExtended({ query }, true)
        .then(projects => res.status(200).json({
          data: projects.models,
          count: projects.pagination.rowCount,
        }));
    },
  ],

  param: (req, res, next, id) =>
    projectController
      .get({ id }, ['owner', 'supervisor', 'members'])
      .then((param) => {
        req.app.locals.project = param;
        next();
      }),
};
