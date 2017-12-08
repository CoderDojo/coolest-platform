const uuid = require('uuid/v4');

module.exports = (bookshelf) => {
  return bookshelf.knex('event')
    .insert({
      id: uuid(),
      name: 'CP-2018',
      slug: 'cp-2018',
      categories: { scratch: 'Scratch', web: 'Websites & Web Games', evolution: 'Evolution' },
    });
};
