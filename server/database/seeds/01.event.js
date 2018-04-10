const uuid = require('uuid/v4');

exports.seed = (knex, Promise) =>
  knex.raw('TRUNCATE TABLE event CASCADE').then(() => {
    const eventDate = new Date();
    eventDate.setHours(23);

    return knex('event').insert({
      id: uuid(),
      date: eventDate,
      tz: 'Europe/Dublin',
      location: 'RDS Main Arena, Ballsbridge, Dublin 4',
      name: 'CP-2018',
      slug: 'cp-2018',
      categories: { scratch: 'Scratch', web: 'Websites & Web Games', evolution: 'Evolution' },
    });
  });
