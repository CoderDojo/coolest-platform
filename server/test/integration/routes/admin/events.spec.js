const { setup, cleanup } = require('../../../setup-db');
const request = require('supertest');

describe('integration: events admin', () => {
  let token;
  let eventId;

  before(async () => {
    await setup();
    eventId = (await util.event.get('cp-2018')).body.id;
    token = await util.user.create('verifyingproject@example.com');
  });

  describe('POST /admin/events/:id/emails/confirmAttendance', () => {
    it('should return 401 for a basic user', async () => {
      return request(app)
        .post(`/api/v1/admin/events/${eventId}/emails/confirmAttendance?token=${token}`)
        .send()
        .expect(403);
    });

    it('should return 204 for an admin user', async () => {
      const beforeSend = new Date();
      const adminToken = (await util.auth.get('hello@coolestprojects.org')).rows[0].token;
      return request(app)
        .post(`/api/v1/admin/events/${eventId}/emails/confirmAttendance?token=${adminToken}`)
        .send()
        .expect(204)
        .then(async () => {
          const afterSend = (await util.event.get('cp-2018')).body.lastConfirmationEmailDate;
          expect(new Date(afterSend)).to.be.above(beforeSend);
          return Promise.resolve();
        });
    });
  });
  after(cleanup);
});
