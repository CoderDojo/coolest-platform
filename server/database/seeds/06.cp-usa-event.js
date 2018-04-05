const uuid = require('uuid/v4');

exports.seed = (knex, Promise) => {
  const eventDate = new Date();
  eventDate.setHours(23);

  return knex('event').insert({
    id: uuid(),
    date: eventDate,
    location: 'SOMEWHERE I BELOOONG',
    name: 'CP North America 2018',
    slug: 'na-2018',
    categories: { scratch: 'Scratch', web: 'Websites & Web Games', evolution: 'Evolution' },
    questions: '["require_power", "require_wifi", "is_hazardous", "other_requirements"]',
  });
};
