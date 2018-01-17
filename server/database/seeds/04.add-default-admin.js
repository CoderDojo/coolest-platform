const jwt = require('jsonwebtoken');
const uuid = require('uuid/v4');
const config = require('../../config/auth');
const bcrypt = require('bcrypt');

const userId = uuid();
const authId = uuid();
const hash = bcrypt.hashSync('banana', 10);
const token = jwt.sign({ data: userId }, config.authSecret, { expiresIn: '2h' });
exports.seed = (knex, Promise) => knex.raw(`INSERT INTO "public".user(id, email) VALUES('${userId}', 'hello@coolestprojects.org')`)
  .then(() => knex.raw(`INSERT INTO auth(id, role, token, user_id, password) VALUES('${authId}', 'admin', '${token}', '${userId}', '${hash}')`));

