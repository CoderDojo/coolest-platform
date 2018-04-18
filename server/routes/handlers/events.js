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
        const event = await eventController.get({ id: req.params.eventId });
        const projects = await projectController.getExtended({
          scopes: { event_id: event.id },
          deleted_at: 'NULL',
        });
        await req.app.locals.mailing.sendConfirmAttendanceEmail(projects.toJSON(), {
          ...event.attributes,
          date: event.formattedDate(),
        });
        res.status(204).send();
      } catch (err) {
        req.app.locals.logger.error(err);
        next(new Error('Error while sending confirm attendance emails'));
      }
    },
  ],
};
