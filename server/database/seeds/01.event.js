const uuid = require('uuid/v4');

exports.seed = (knex, Promise) => knex.raw('TRUNCATE TABLE event CASCADE')
  .then(() =>
    knex('event')
      .insert({
        id: uuid(),
        name: 'CP-2018',
        slug: 'cp-2018',
        categories: { scratch: 'Scratch', web: 'Websites & Web Games', evolution: 'Evolution' },
      }));
