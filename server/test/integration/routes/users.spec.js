// TODO fix parallel tests
const request = require('supertest');
const proxy = require('proxyquire');
const dbConfig = require('../../config/db.js');
const seeder = require('../../database/seed');

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
          expect(res.body.auth).to.have.all.keys(['userId', 'created_at', 'updated_at', 'id', 'token']);
          expect(res.body.user.email).to.equal(payload.email);
          expect(res.body.user.id).to.equal(res.body.auth.userId);
          refToken = res.body.auth.token;
        });
    });

    it('should return the user if there is no project', async () => {
      const payload = { email: 'me@example.com' };
      // We delay this so that refToken != from new token (time based)
      // Also, "ensure" that refToken is populated
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
              expect(res.body.auth).to.have.all.keys(['userId', 'createdAt', 'updatedAt', 'id', 'token']);
              expect(res.body.user.email).to.equal(payload.email);
              expect(res.body.user.id).to.equal(res.body.auth.userId);
            });
        });
    });
  });
  after(() => {
    app.close();
  });
});
