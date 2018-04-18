const request = require('supertest');
const proxy = require('proxyquire');
const dbConfig = require('../../../config/db.js');
const seeder = require('../../../database/seed');
const utils = require('../../utils');

dbConfig['@global'] = true;
dbConfig['@noCallThru'] = true;
describe('integration: events admin', () => {
  let app;
  let token;
  let eventId;
  let util;

  before(async () => {
    app = await proxy(
      '../../../../bin/www',
      {
        '../config/db.json': dbConfig,
        '../database/seed': seeder,
      },
    )({ seed: true });
    util = utils(app);
    eventId = (await util.event.get('cp-2018')).body.id;
    token = await util.user.create('verifyingproject@example.com');
  });

  after(() => {
    app.close();
  });

  describe('POST /admin/events/:id/emails/confirmAttendance', () => {
    it('should return 401 for a basic user', async () => {
      return request(app)
        .post(`/api/v1/admin/events/${eventId}/emails/confirmAttendance?token=${token}`)
        .send()
        .expect(403);
    });

    it('should return 204 for an admin user', async () => {
      const adminToken = (await util.auth.get('hello@coolestprojects.org'))[0].token;
      return request(app)
        .post(`/api/v1/admin/events/${eventId}/emails/confirmAttendance?token=${adminToken}`)
        .send()
        .expect(204);
    });
  });
});
