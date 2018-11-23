const { setup, cleanup } = require('../../setup-db');
const request = require('supertest');

describe('integration: projects with open event by default', () => {
  let eventId;

  async function getDefaultEvent() {
    await request(app)
      .get('/api/v1/events/cp-2018')
      .then((res) => {
        eventId = res.body.id;
      });
  }

  describe('/users/:uId/projects GET', () => {
    let userId;
    let refToken;
    let refProject;
    before(async () => {
      await setup();
      await getDefaultEvent();
      await util.user.create('listuserprojects@example.com', true)
        .then((res) => {
          userId = res.user.id;
          refToken = res.auth.token;
        });
      refProject = (await util.project.create(refToken, eventId)).body;
    });
    after(cleanup);
    it('should return the user projects', async () => {
      await request(app)
        .get(`/api/v1/events/${eventId}/users/${userId}/projects?token=${refToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body.data.length).to.equal(1);
          expect(res.body.count).to.equal(1);
          expect(Object.keys(res.body)).to.eql(['data', 'count']);
          expect(res.body.data[0]).to.have.all.keys(['id', 'name', 'category', 'createdAt', 'updatedAt', 'deletedAt', 'eventId', 'description', 'answers', 'org', 'orgRef', 'state', 'city', 'owner', 'supervisor', 'members', 'status']);
          expect(res.body.data[0].owner).to.have.all.keys(['id', 'firstName', 'lastName', 'dob', 'gender', 'specialRequirements', 'email', 'phone', 'country', 'createdAt', 'updatedAt', 'deletedAt']);
          expect(res.body.data[0].supervisor).to.have.all.keys(['id', 'firstName', 'lastName', 'dob', 'gender', 'specialRequirements', 'email', 'phone', 'country', 'createdAt', 'updatedAt', 'deletedAt']);
          expect(res.body.data[0].members[0]).to.have.all.keys(['id', 'firstName', 'lastName', 'dob', 'gender', 'specialRequirements', 'email', 'phone', 'country', 'createdAt', 'updatedAt', 'deletedAt']);
          expect(refProject.id).to.equal(res.body.data[0].id);
          expect(res.body.data[0].owner.id).to.be.equal(userId);
        });
    });
    it('should return multiple projects', async () => {
      await util.project.create(refToken, eventId)
        .then(() => {
          return request(app)
            .get(`/api/v1/events/${eventId}/users/${userId}/projects?token=${refToken}`)
            .expect(200)
            .then((res) => {
              expect(res.body.data.length).to.equal(2);
              expect(res.body.count).to.equal(2);
              expect(Object.keys(res.body)).to.eql(['data', 'count']);
              expect(res.body.data[0]).to.have.keys(['id', 'name', 'category', 'createdAt', 'updatedAt', 'deletedAt', 'eventId', 'description', 'answers', 'org', 'orgRef', 'state', 'city', 'owner', 'supervisor', 'members', 'status']);
              expect(res.body.data[0].owner).to.have.all.keys(['id', 'firstName', 'lastName', 'dob', 'gender', 'specialRequirements', 'email', 'phone', 'country', 'createdAt', 'updatedAt', 'deletedAt']);
              expect(res.body.data[0].supervisor).to.have.all.keys(['id', 'firstName', 'lastName', 'dob', 'gender', 'specialRequirements', 'email', 'phone', 'country', 'createdAt', 'updatedAt', 'deletedAt']);
              expect(res.body.data[0].members[0]).to.have.all.keys(['id', 'firstName', 'lastName', 'dob', 'gender', 'specialRequirements', 'email', 'phone', 'country', 'createdAt', 'updatedAt', 'deletedAt']);
              expect(res.body.data[0].owner.id).to.be.equal(userId);
              expect(res.body.data[1].owner.id).to.be.equal(userId);
              expect(res.body.data[1].id).to.not.be.equal(res.body.data[0].id);
            });
        });
    });
    it('should not return someone else projects list', async () => {
      await util.user.create('listanotheruserprojects@example.com')
        .then((_refToken) => {
          return request(app)
            .get(`/api/v1/events/${eventId}/users/${userId}/projects?token=${_refToken}`)
            .expect(200)
            .then((res) => {
              expect(res.body.data.length).to.equal(0);
              expect(res.body.count).to.equal(0);
            });
        });
    });
  });
});
