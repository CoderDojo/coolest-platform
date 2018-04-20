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
          deleted_at: 'NULL',
          status: 'pending',
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
};
