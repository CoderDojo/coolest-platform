const { setup, cleanup } = require('../../setup-db');
const request = require('supertest');
const moment = require('moment');

describe('integration: projects with open event by default', () => {
  let token;
  let eventId;
  let projectId;

  before(async () => {
    await setup();
    eventId = (await util.event.get('cp-2018')).body.id;
    token = await util.user.create('verifyingproject@example.com');
    projectId = (await util.project.create(token, eventId)).body.id;
  });

  describe('/:id/status patch', () => {
    it('should allow update of a status of a project', async () => {
      const payload = {
        status: 'confirmed',
      };
      return request(app)
        .patch(`/api/v1/events/${eventId}/projects/${projectId}/status`)
        .send(payload)
        .expect(200)
        .then((res) => {
          expect(res.body).to.be.empty;
        });
    });
    it('should fail if event is frozen', async () => {
      const payload = {
        status: 'confirmed',
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
  after(cleanup);
});
