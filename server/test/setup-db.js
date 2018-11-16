const Knex = require('knex');
const proxy = require('proxyquire');
const seeder = require('./database/seed');
const utils = require('./integration/utils');

const createdDbs = [];
const knex = Knex({
  client: 'postgres',
  connection: {
    host: 'db',
    user: 'cool-user',
    password: 'cool-password',
    database: 'postgres',
  },
});

module.exports.setup = (async () => {
  const name = `cool_database_test_${Date.now()}`;
  await knex.raw(`CREATE DATABASE ${name}`);
  const dbConfig = {
    client: 'postgres',
    connection: {
      host: 'db',
      user: 'cool-user',
      password: 'cool-password',
      database: name,
    },
    // debug: true,
    searchPath: ['knex', 'public'],
  };
  dbConfig['@global'] = true;
  dbConfig['@noCallThru'] = true;
  global.app = await proxy(
    '../bin/www',
    {
      '../config/db.json': dbConfig,
      '../database/seed': seeder,
    },
  )({ seed: true });
  global.db = app.app.locals.bookshelf.knex;
  createdDbs.push({
    db: global.db,
    name,
  });
  global.util = utils(app);
});

module.exports.cleanup = () => {
  app.close();
};

after(() => {
  const deletePromises = [];
  createdDbs.forEach((db) => {
    deletePromises.push((async () => {
      await db.db.destroy();
      await knex.raw(`DROP DATABASE ${db.name}`);
    })());
  });
  return Promise.all(deletePromises)
    .then(() => knex.destroy());
});
