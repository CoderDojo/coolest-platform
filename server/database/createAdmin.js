const uuid = require('uuid/v4');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/auth');

module.exports = async (bookshelf) => {
  const adminEmail = process.env.MASTER_ADMIN_EMAIL;
  const existingAdmin = await bookshelf.knex('user').where('email', '=', adminEmail);
  if (!existingAdmin.length) {
    const userId = uuid();
    const authId = uuid();
    const hash = bcrypt.hashSync(process.env.MASTER_ADMIN_PASSWORD, 10);
    const token = jwt.sign({ data: userId }, config.authSecret, { expiresIn: '2h' });
    await bookshelf.knex.raw(`INSERT INTO "public".user(id, email) VALUES('${userId}', '${adminEmail}')`);
    await bookshelf.knex.raw(`INSERT INTO auth(id, role, token, user_id, password) VALUES('${authId}', 'admin', '${token}', '${userId}', '${hash}')`);
  }
  return Promise.resolve(bookshelf);
};
