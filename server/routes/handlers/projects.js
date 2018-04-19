const json2csv = require('json2csv');
const projectController = require('../../controllers/projects');
const userController = require('../../controllers/users');
const eventController = require('../../controllers/events');
const CSVHeaderSerializer = require('../../models/projectCSVSerializer');

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
    (req, res, next) => {
      req.app.locals.mailing
        .sendWelcomeEmail(
          req.user.user,
          res.locals.project,
          { ...req.app.locals.event.attributes, date: req.app.locals.event.formattedDate() },
        )
        .then(() => next())
        .catch(next);
    },
    (req, res) => res.status(200).json(res.locals.project),
  ],

  get: [
    (req, res) => res.status(200).json(req.app.locals.project),
  ],

  patch: [
    (req, res, next) =>
      projectController
        // Save by ensuring the payload contains the proper id which is used for perms
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

  patchStatus: [
    (req, res, next) =>
      projectController
        // Save by ensuring the payload contains the proper id which is used for perms
        .update(req.app.locals.project, { status: req.body.status }, { id: req.params.id })
        .then(() => next())
        .catch((err) => {
          req.app.locals.logger.error(err);
          return next(new Error('Error while saving your project.'));
        }),
    (req, res) => res.status(200).send(),
  ],

  put: [
    (req, res, next) => {
      req.app.locals.users = req.body.users;
      delete req.body.users;
      return projectController
        // Save by ensuring the payload contains the proper id which is used for perms
        .update(req.app.locals.project, Object.assign({}, req.body, { id: req.params.id }))
        // Pull the original list of users so we can diff in next step
        // User_association helps us retrieve the users's roles in the project based on user_id
        .then(p => p.refresh({ withRelated: ['users', 'userAssociations'] }))
        .then((project) => {
          res.locals.project = project;
          return next();
        })
        .catch((err) => {
          req.app.locals.logger.error(err);
          return next(new Error('Error while saving your project.'));
        });
    },
    // Delete missing users
    (req, res, next) => {
      const origProject = res.locals.project.toJSON();
      const origUsers = origProject.users;
      const users = req.app.locals.users;
      const missingUsers = projectController.getMissingUsers(
        origUsers,
        users,
        origProject.userAssociations,
      );
      // Delete sync
      return projectController.removeUsers(origProject.id, missingUsers)
        .then(() => userController.removeUsers(missingUsers))
        .then(() => next())
        .catch((err) => {
          req.app.locals.logger.error(err);
          return next(new Error('Error while saving your project.'));
        });
    },
    // Create missing or update current users
    (req, res, next) => {
      let users = req.app.locals.users;
      const assoc = res.locals.project.toJSON().userAssociations;
      // Select from the users payload - to be saved - any user that
      // has an id that is already part of the project
      // OR is not an owner
      users = users.filter(u =>
        u.type !== 'owner' &&
        (!!assoc.find(m =>
          m.userId === u.id || u.id === undefined)));
      // Update sync
      const saveUser = (user) => {
        const type = user.type;
        delete user.type;
        return userController.save(user)
          .then((_user) => {
            if (!user.id) {
              return res.locals.project.users().attach({ type, userId: _user.id });
            }
            return Promise.resolve();
          });
      };
      return Promise.all(users.map(saveUser))
        .then(() => next())
        .catch((err) => {
          req.app.locals.logger.error(err);
          return next(new Error('Error while saving your project.'));
        });
    },
    // Format payload by refreshing users field
    (req, res) => {
      return projectController.get({ id: req.params.id }, ['users'])
        .then(project => res.status(200).json(project));
    },
  ],

  getAll: [
    (req, res) => {
      const paginated = !(req.query.format && req.query.format === 'csv');
      req.query.scopes = { event_id: req.params.eventId };

      return projectController.getExtended(req.query, paginated).then((projects) => {
        if (!paginated) {
          res.setHeader('Content-Type', 'text/csv');
          const data = projects.toJSON();
          const maxParticipants = data.length > 0 ?
            Math.max(...data.map(x => x.members).map(x => x.length))
            : 0;
          // The serializer is not attached to the model
          // We may have no models to render the header from
          const fields = CSVHeaderSerializer(
            req.app.locals.event.attributes.questions,
            maxParticipants,
          );
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
      const scopes = { 'owner.id': req.user.userId, event_id: req.params.eventId };
      return projectController.getExtended({ scopes }, true)
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

  eventParam: (req, res, next, id) =>
    eventController
      .get({ id })
      .then((param) => {
        if (param) {
          req.app.locals.event = param;
          return next();
        }
        const err = new Error('Event not found');
        err.status = 404;
        return next(err);
      }),
};
