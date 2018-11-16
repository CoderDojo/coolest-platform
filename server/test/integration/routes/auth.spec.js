const { setup, cleanup } = require('../../setup-db');
const request = require('supertest');
const jwt = require('jsonwebtoken');

describe('integration: users', () => {
  let refToken;
  before(async () => {
    await setup();
    return util.user.create('fak@in.death')
      .then((token) => { refToken = token; });
  });

  describe('post', () => {
    it('should return 200 on valid basic token', async () => {
      const payload = { token: refToken };
      await request(app)
        .post('/api/v1/auth/token')
        .set('Accept', 'application/json')
        .send(payload)
        .expect(200)
        .then((res) => {
          expect(Object.keys(res.body)).to.eql(['userId']);
          expect(res.body.userId.length).to.equal(36);
        });
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
      const adminToken = (await db.raw('SELECT token FROM auth JOIN "public".user u ON u.id = auth.user_id WHERE u.email = \'hello@coolestprojects.org\'')).rows[0].token;
      expect(adminToken.length).to.be.equal(189);
      const payload = { token: adminToken };

      await request(app)
        .post('/api/v1/auth/token')
        .set('Accept', 'application/json')
        .send(payload)
        .expect(401);
    });
  });
  after(cleanup);
});
