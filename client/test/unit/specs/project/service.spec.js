import Vue from 'vue';
import ProjectService from '@/project/service';

describe('Project service', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.reset();
    sandbox.restore();
  });

  describe('list()', () => {
    it('should make a get call to /api/v1/events/:eventId/projects with given eventId', async () => {
      // ARRANGE
      const eventId = 'cp2018';
      sandbox.stub(Vue.http, 'get')
        .withArgs(`/api/v1/events/${eventId}/projects`)
        .resolves('success');

      // ACT
      const response = await ProjectService.list(eventId);

      // ASSERT
      expect(response).to.equal('success');
    });
  });

  describe('get()', () => {
    it('should make a get call to /api/v1/events/:eventId/projects/:projectId with given eventId and proejctId', async () => {
      // ARRANGE
      const eventId = 'cp2018';
      const projectId = 'foo';
      sandbox.stub(Vue.http, 'get')
        .withArgs(`/api/v1/events/${eventId}/projects/${projectId}`)
        .resolves('success');

      // ACT
      const response = await ProjectService.get(eventId, projectId);

      // ASSERT
      expect(response).to.equal('success');
    });
  });

  describe('create()', () => {
    it('should make a post to create the given project', async () => {
      // ARRANGE
      const eventId = 'cp2018';
      const project = {
        name: 'Project McProjectface',
      };
      sandbox.stub(Vue.http, 'post')
        .withArgs(`/api/v1/events/${eventId}/projects`, project)
        .resolves('success');

      // ACT
      const response = await ProjectService.create(eventId, project);

      // ASSERT
      expect(response).to.equal('success');
    });
  });

  describe('update()', () => {
    it('should make a patch request to update the given project', async () => {
      // ARRANGE
      const eventId = 'cp2018';
      const projectId = 'foo';
      const project = {
        name: 'Project McProjectface',
      };
      sandbox.stub(Vue.http, 'patch')
        .withArgs(`/api/v1/events/${eventId}/projects/${projectId}`, project)
        .resolves('success');

      // ACT
      const response = await ProjectService.update(eventId, projectId, project);

      // ASSERT
      expect(response).to.equal('success');
    });
  });
});
