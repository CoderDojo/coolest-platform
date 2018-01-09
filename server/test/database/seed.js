const uuid = require('uuid/v4');

module.exports = (bookshelf) => {
  const eventDate = new Date();
  eventDate.setHours(23);

  return bookshelf.knex('event')
    .insert({
      id: uuid(),
      date: eventDate,
      location: 'RDS Main Arena, Ballsbridge, Dublin 4',
      name: 'CP-2018',
      slug: 'cp-2018',
      categories: { scratch: 'Scratch', web: 'Websites & Web Games', evolution: 'Evolution' },
      questions: ['social_project', 'educational_project', 'innovator_stage'],
    });
};
