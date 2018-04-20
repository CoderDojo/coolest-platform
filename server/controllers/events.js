const EventModel = require('../models/event');

class EventController {
  static get(identifier) {
    return new EventModel(identifier).fetch();
  }

  static update(originalEvent, event) {
    return originalEvent.save(event, { method: 'update', patch: true });
  }
}

module.exports = EventController;
