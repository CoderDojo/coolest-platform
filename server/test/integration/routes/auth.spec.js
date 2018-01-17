// TODO fix parallel tests
const request = require('supertest');
const proxy = require('proxyquire');
const dbConfig = require('../../config/db.js');
const seeder = require('../../database/seed');
const utils = require('../utils');
const jwt = require('jsonwebtoken');

dbConfig['@global'] = true;
dbConfig['@noCallThru'] = true;
describe('integration: users', () => {
  let app;
  let refToken;
  let util;
  let db;
  before(async () => {
    app = await proxy(
      '../../../bin/www',
      {
        '../config/db.json': dbConfig,
        '../database/seed': seeder,
      },
    )({ seed: true });
    db = app.app.locals.bookshelf.knex;
    util = utils(app);
    return util.user.create('fak@in.death')
      .then((token) => { refToken = token; });
  });

  describe('post', () => {
    it('should return 204 on valid basic token', async () => {
      const payload = { token: refToken };
      await request(app)
        .post('/api/v1/auth/token')
        .set('Accept', 'application/json')
        .send(payload)
        .expect(204);
    });

    it('should return 401 on invalid basic token', async () => {
      // we create a falsy token
      const payload = { token: jwt.sign({ data: 'muhHaxxor' }, 'MuhSecret', { expiresIn: '8h' }) };
      await request(app)
        .post('/api/v1/auth/token')
        .set('Accept', 'application/json')
        .send(payload)
        .expect(401);
    });

    it('should return 401 on admin token', async () => {
      const res = await db.raw('SELECT token FROM auth JOIN user u ON u.id = auth.user_id WHERE u.email = \'hello@coolestprojects.org\'');
      const adminToken = res[0].token;
      expect(adminToken.length).to.be.equal(189);
      const payload = { token: adminToken };

      await request(app)
        .post('/api/v1/auth/token')
        .set('Accept', 'application/json')
        .send(payload)
        .expect(401);
    });
  });
  after(() => {
    app.close();
  });
});
