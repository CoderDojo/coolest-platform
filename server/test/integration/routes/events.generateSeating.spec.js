const { setup, cleanup } = require('../../setup-db');
const request = require('supertest');

describe('integration: events - generateSeating', () => {
  let token;
  let eventId;

  before(async () => {
    await setup();
    const event = (await util.event.get('cp-2018')).body;
    eventId = event.id;
    token = (await util.auth.get('hello@coolestprojects.org')).rows[0].token;
    const categories = Object.keys(event.categories);
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
        .post(`/api/v1/admin/events/${eventId}/seats?token=${token}`)
        .send()
        .expect(200)
        .then(({ body }) => {
          expect(body.seatingPrepared).to.be.true;
        });
    });
  });

  after(cleanup);
});
