const eventController = require('../../controllers/events');
const projectController = require('../../controllers/projects');

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
  sendConfirmAttendanceEmail: [
    async (req, res, next) => {
      try {
        res.locals.event = await eventController.get({ id: req.params.eventId });
        return next();
      } catch (err) {
        req.app.locals.logger.error(err);
        return next(new Error('Error while sending confirm attendance emails'));
      }
    },
    async (req, res, next) => {
      try {
        const event = res.locals.event;
        const projects = await projectController.getExtended({
          scopes: { event_id: event.id },
          query: { status: 'pending' },
        });
        await req.app.locals.mailing.sendConfirmAttendanceEmail(projects.toJSON(), {
          ...event.attributes,
          date: event.formattedDate(),
        });
        return next();
      } catch (err) {
        req.app.locals.logger.error(err);
        return next(new Error('Error while sending confirm attendance emails'));
      }
    },
    async (req, res, next) => {
      const event = res.locals.event;
      await eventController.update(event, { lastConfirmationEmailDate: new Date() });
      return next();
    },
    async (req, res, next) => res.status(204).send(),
  ],
  generateSeating: [
    (req, res, next) =>
      eventController.get({ id: req.params.eventId })
        .then((event) => { res.app.locals.event = event; next(); }),
    (req, res, next) => {
      if (res.app.locals.event.seatingPrepared) {
        return next(new Error('Cannot regenerate the seating'));
      }
      return next();
    },
    (req, res, next) => {
      let categories = res.app.locals.event.attributes.categories;
      // Technically, the following line is useless on pg, but required for tests (sqlite)
      if (typeof categories === 'string') {
        categories = JSON.parse(categories);
      }
      return Promise.all(Object.keys(categories)
        .map(cat => projectController.setSeating(cat)))
        .then(() => next())
        .catch(() => next(new Error('Error while generating seating')));
    },
    (req, res, next) =>
      eventController.update(res.app.locals.event, { seatingPrepared: true })
        .then(() => {
          res.app.locals.event.refresh();
          return next();
        })
        .catch(err => next(new Error('Error saving event status'))),
    (req, res, next) =>
      res.status(200).send(res.app.locals.event),
  ],
};
