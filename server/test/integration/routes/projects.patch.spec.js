const request = require('supertest');
const moment = require('moment');
const proxy = require('proxyquire');
const dbConfig = require('../../config/db.js');
const seeder = require('../../database/seed');
const utils = require('../utils');

dbConfig['@global'] = true;
dbConfig['@noCallThru'] = true;
describe.only('integration: projects with open event by default', () => {
  let app;
  let token;
  let eventId;
  let projectId;
  let util;

  before(async () => {
    app = await proxy(
      '../../../bin/www',
      {
        '../config/db.json': dbConfig,
        '../database/seed': seeder,
      },
    )({ seed: true });
    util = utils(app);
    eventId = (await util.event.get('cp-2018')).body.id;
    token = await util.user.create('verifyingproject@example.com');
    projectId = (await util.project.create(token, eventId)).body.id;
  });

  describe('/:id/status patch', () => {
    it('should allow update of a status of a project', async () => {
      const payload = {
        status: 'verified',
      };
      return request(app)
        .patch(`/api/v1/events/${eventId}/projects/${projectId}/status`)
        .send(payload)
        .expect(200)
        .then((res) => {
          console.log(res.body);
          expect(res.body).to.be.empty;
        });
    });
    it('should fail if event is frozen', async () => {
      const payload = {
        status: 'verified',
      };
      const clock = sinon.useFakeTimers({
        now: moment.utc().add(3, 'day').toDate(),
      });
      return request(app)
        .patch(`/api/v1/events/${eventId}/projects/${projectId}/status`)
        .send(payload)
        .expect(403)
        .then(() => {
          clock.restore();
        });
    });
  });

  after(() => {
    app.close();
  });
});
