const { setup, cleanup } = require('../../setup-db');
const request = require('supertest');

describe('integration: users', () => {
  let refToken;

  before(setup);
  describe('post', () => {
    it('should create a user', async () => {
      const payload = { email: 'me@example.com', eventSlug: 'cp-2018' };
      await request(app)
        .post('/api/v1/users')
        .set('Accept', 'application/json')
        .send(payload)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
          expect(res.body.user).to.have.all.keys(['email', 'created_at', 'updated_at', 'id']);
          // eslint-disable-next-line max-len
          expect(res.body.auth).to.have.all.keys(['userId', 'createdAt', 'updatedAt', 'id', 'token', 'role']);
          expect(res.body.user.email).to.equal(payload.email);
          expect(res.body.user.id).to.equal(res.body.auth.userId);
          refToken = res.body.auth.token;
        });
    });

    it('should send an auth email for a returning user', async () => {
      const payload = { email: 'me@example.com', eventSlug: 'cp-2018' };
      await request(app)
        .post('/api/v1/users')
        .set('Accept', 'application/json')
        .send(payload)
        .expect('Content-Type', /json/)
        .expect(409);
    });

    it('should not work for admin user', async () => {
      const payload = { email: 'hello@coolestprojects.org', eventSlug: 'cp-2018' };
      await request(app)
        .post('/api/v1/users')
        .set('Accept', 'application/json')
        .send(payload)
        .expect('Content-Type', /json/)
        .expect(401);
    });

    it('should not create a user when the email exists (case insensitive)', async () => {
      const payload = { email: 'Me@example.com', eventSlug: 'cp-2018' };
      return util.event.get('cp-2018')
        .then(res => util.project.create(refToken, res.body.id))
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
  describe('get', () => {
    let adminToken;
    before(async () => {
      adminToken = (await util.auth.get('hello@coolestprojects.org')).rows[0].token;
    });
    it('should reject if requesting user is not an admin', async () => {
      await util.user.get(refToken)
        .expect(403);
    });
    it('should return a list of users', async () => {
      await util.user.get(adminToken)
        .expect(200)
        .then((res) => {
          expect(res.body.count).to.equal(333);
          expect(res.body.data.length).to.equal(25);
          expect(res.body.data[0]).to.have.all.keys(['id', 'firstName', 'lastName', 'dob', 'gender', 'specialRequirements', 'email', 'phone', 'country', 'createdAt', 'updatedAt', 'deletedAt', 'membership']);
        });
    });
    it('should filter out admins from the user list', async () => {
      await util.user.get(adminToken)
        .expect(200)
        .then((res) => {
          expect(res.body.data.map(u => u.email)).to.not.includes('hello@coolestprojects.org');
        });
    });
    it('should accept some params', async () => {
      await util.user.get(adminToken, 'query[gender]=female')
        .expect(200)
        .then((res) => {
          expect(res.body.count).to.be.below(110 * 3);
        });
    });
  });
  after(cleanup);
});
