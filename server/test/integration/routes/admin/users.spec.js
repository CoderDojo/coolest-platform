const { setup, cleanup } = require('../../../setup-db');
const request = require('supertest');

describe('integration: users', () => {
  let refToken;
  const payload = { email: 'conorishacking@coderdojo.org', password: 'batman' };
  before(async () => {
    await setup();
    refToken = (await util.auth.get('hello@coolestprojects.org')).rows[0].token;
  });

  describe('post', () => {
    it('should return 403 if the user is not an admin', async () => {
      const token = await util.user.create('normaluser@sink.sendgrid.net');
      await request(app)
        .post(`/api/v1/admin/users?token=${token}`)
        .set('Accept', 'application/json')
        .send(payload)
        .expect(403);
    });
    it('should return 403 if the admin is not hello@coolestprojects.org', async () => {
      await db.raw("UPDATE public.user SET email = 'admin@coderdojo.org' WHERE email = 'hello@coolestprojects.org'");
      await request(app)
        .post(`/api/v1/admin/users?token=${refToken}`)
        .set('Accept', 'application/json')
        .send(payload)
        .expect(403);
    });
    it('should return 200 if the admin is hello@coolestprojects.org', async () => {
      await db.raw("UPDATE public.user SET email = 'hello@coolestprojects.org' WHERE email = 'admin@coderdojo.org'");
      await request(app)
        .post(`/api/v1/admin/users?token=${refToken}`)
        .set('Accept', 'application/json')
        .send(payload)
        .expect(200)
        .then((res) => {
          expect(res.body).to.be.empty;
        });
    });
  });
  after(cleanup);
});
