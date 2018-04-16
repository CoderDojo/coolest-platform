const request = require('supertest');
const proxy = require('proxyquire');
const dbConfig = require('../../config/db.js');
const seeder = require('../../database/seed');
const utils = require('../utils');

dbConfig['@global'] = true;
dbConfig['@noCallThru'] = true;
describe.only('integration: events - generateSeating', () => {
  let app;
  let token;
  let eventId;
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
    const event = (await util.event.get('cp-2018')).body;
    eventId = event.id;
    token = (await util.auth.get('hello@coolestprojects.org'))[0].token;
    const categories = Object.keys(JSON.parse(event.categories));
    return Promise.all(new Array(100).fill(1)
      .map(async (value, index) => {
        const _token = await util.user.create(`test${index}@example.com`);
        return util.project.create(_token, eventId, {
          name: `MyPoneyProject ${index}`,
          category: categories[Math.ceil(Math.random() * categories.length)],
          users: [
            {
              firstName: 'kid1',
              lastName: 'kido',
              dob: '2008-12-01T20:00.000Z',
              gender: 'male',
              type: 'member',
            },
            {
              firstName: 'orga',
              lastName: 'le',
              dob: '1991-12-01T20:00.000Z',
              gender: 'male',
              email: 'lala@example.com',
              phone: '3538123123123',
              country: 'IE',
              type: 'supervisor',
            },
          ],
        });
      }));
  });

  describe('POST /seating', () => {
    it('should set the seats for all projects categories', () => {
      return request(app)
        .post(`/api/v1/events/${eventId}/seats?token=${token}`)
        .send()
        .expect(200);
    });
  });
});
