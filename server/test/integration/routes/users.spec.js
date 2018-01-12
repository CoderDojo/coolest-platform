// TODO fix parallel tests
const request = require('supertest');
const proxy = require('proxyquire');
const dbConfig = require('../../config/db.js');
const seeder = require('../../database/seed');
const utils = require('../utils');


dbConfig['@global'] = true;
dbConfig['@noCallThru'] = true;
describe('integration: users', () => {
  let app;
  let refToken;
  before(async () => {
    app = await proxy(
      '../../../bin/www',
      {
        '../config/db.json': dbConfig,
        '../database/seed': seeder,
      },
    )({ seed: true });
    return app;
  });

  describe('post', () => {
    it('should create a user', async () => {
      const payload = { email: 'me@example.com' };
      await request(app)
        .post('/api/v1/users')
        .set('Accept', 'application/json')
        .send(payload)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
          expect(res.body.user).to.have.all.keys(['email', 'created_at', 'updated_at', 'id']);
          // eslint-disable-next-line max-len
          expect(res.body.auth).to.have.all.keys(['userId', 'created_at', 'updated_at', 'id', 'token', 'role']);
          expect(res.body.user.email).to.equal(payload.email);
          expect(res.body.user.id).to.equal(res.body.auth.userId);
          refToken = res.body.auth.token;
        });
    });

    it('should return the user if there is no project', async () => {
      const payload = { email: 'me@example.com' };
      await new Promise(resolve => setTimeout(resolve, 1000))
        .then(() => {
          return request(app)
            .post('/api/v1/users')
            .set('Accept', 'application/json')
            .send(payload)
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
              expect(res.body.auth.token).to.not.equal(refToken);
              expect(res.body.user).to.have.all.keys(['email', 'createdAt', 'updatedAt', 'id', 'firstName', 'lastName', 'country', 'dob', 'gender', 'phone', 'specialRequirements']);
              // eslint-disable-next-line max-len
              expect(res.body.auth).to.have.all.keys(['userId', 'createdAt', 'updatedAt', 'id', 'token', 'role']);
              expect(res.body.user.email).to.equal(payload.email);
              expect(res.body.user.id).to.equal(res.body.auth.userId);
              refToken = res.body.auth.token;
            });
        });
    });

    it('should not create a user when the email exists (case insensitive)', async () => {
      const payload = { email: 'Me@example.com' };
      const reqUtils = utils(app);
      return reqUtils.event.get('cp-2018')
        .then(res => reqUtils.project.create(refToken, res.body.id))
        .then(() => {
          return request(app)
            .post('/api/v1/users')
            .set('Accept', 'application/json')
            .send(payload)
            .expect('Content-Type', /json/)
            .expect(409);
        });
    });
  });
  after(() => {
    app.close();
  });
});
