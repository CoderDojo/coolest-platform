const uuid = require('uuid/v4');
const config = require('../../config/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


module.exports = (bookshelf) => {
  const knex = bookshelf.knex;
  const eventDate = new Date();
  eventDate.setHours(23);

  function createUser(email, password, withAuth) {
    const userId = uuid();
    const authId = uuid();
    const token = jwt.sign({ data: userId }, config.authSecret, { expiresIn: '2h' });
    return knex.raw(`INSERT INTO user(id, email) VALUES('${userId}', '${email}')`)
      .then(() => {
        if (password) {
          const hash = bcrypt.hashSync(password, 10);
          return knex.raw(`INSERT INTO auth(id, role, token, user_id, password) VALUES('${authId}', 'admin', '${token}', '${userId}', '${hash}')`);
        } else if (withAuth) {
          return knex.raw(`INSERT INTO auth(id, role, token, user_id) VALUES('${authId}', 'basic', '${token}', '${userId}')`);
        }
      });
  }

  return knex('event')
    .insert({
      id: uuid(),
      date: eventDate,
      location: 'RDS Main Arena, Ballsbridge, Dublin 4',
      name: 'CP-2018',
      slug: 'cp-2018',
      categories: { scratch: 'Scratch', web: 'Websites & Web Games', evolution: 'Evolution' },
      questions: ['social_project', 'educational_project', 'innovator_stage'],
    })
    .then(() => createUser('hello@coolestprojects.org', 'banana'))
    .then(() => createUser('me@example.com'));
};
