const uuid = require('uuid/v4');
const moment = require('moment');

exports.seed = (knex, Promise) => {
  const eventDate = moment.utc().add(2, 'days');
  eventDate.set('hour', 23);

  return knex('event').insert({
    id: uuid(),
    date: eventDate,
    tz: 'America/Los_Angeles',
    location: 'SOMEWHERE I BELOOONG',
    contact: 'northamerica@coolestprojects.org',
    homepage: 'coolestprojects.org/north-america',
    name: 'CP North America 2018',
    slug: 'na-2018',
    categories: { scratch: 'Scratch', web: 'Websites & Web Games', evolution: 'Evolution' },
    questions: '["require_power", "require_wifi", "is_hazardous", "other_requirements", "travel_stipend"]',
    registration_start: eventDate.clone().subtract(3, 'days'),
    registration_end: eventDate.clone().subtract(1, 'days'),
    freeze_date: eventDate,
  });
};
