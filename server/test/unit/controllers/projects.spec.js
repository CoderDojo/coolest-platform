const proxy = require('proxyquire').noCallThru();
const { omit, extend } = require('lodash');

describe('projects controllers', () => {
  const sandbox = sinon.sandbox.create();
  describe('post', () => {
    let creatorMock;
    before(() => {
      creatorMock = {
        id: 'userX',
      };
    });
    beforeEach(() => {
      sandbox.reset();
    });
    it('should create a project and its associated users', async () => {
      // DATA
      const eventId = 'eventId';
      const name = 'MyLittleProject';
      const category = 'Flash';
      const dojoId = '';
      const alternativeReference = 'Code Club';
      const member = {
        firstName: 'member',
        lastName: 'one',
        dob: '2010-09-01T00:00.000Z',
        specialRequirements: 'must eat a banana every minutes',
        country: 'FR',
        type: 'member',
      };
      const supervisor = {
        firstName: 'supervisor',
        lastName: 'one',
        dob: '2010-09-01T00:00.000Z',
        type: 'supervisor',
        email: 'a@aa.a',
        phone: '01234567',
      };

      // STUBs
      const mockUserSaveMember = sandbox.stub().resolves({ id: 'user1', toJSON: () => ({ id: 'user1' }) });
      const mockUserSaveSupervisor = sandbox.stub().resolves({ id: 'user2', toJSON: () => ({ id: 'user2' }) });
      const mockProjectSave = sandbox.stub().resolves({ id: 'project', toJSON: () => ({ id: 'project' }) });
      const mockAttachProject = sinon.stub().resolves({});
      const mockMembersProject = sandbox.stub().returns({
        attach: mockAttachProject,
      });
      // Multiple withArgs must be splitted : https://github.com/sinonjs/sinon/issues/176
      const mockUserModel = sandbox.stub();
      mockUserModel.withArgs(omit(member, ['type'])).returns({
        save: mockUserSaveMember,
      });
      mockUserModel.withArgs(extend(omit(supervisor, ['type']), { id: 'user2' })).returns({
        save: mockUserSaveSupervisor,
      });
      const mockProjectModel = sandbox.stub().returns({
        save: mockProjectSave,
        members: mockMembersProject,
      });
      const mockUserHandler = {
        get: sandbox.stub().resolves({ id: 'user2' }),
      };
      const controllers = proxy('../../../controllers/projects', {
        '../models/user': mockUserModel,
        '../models/project': mockProjectModel,
        './users': mockUserHandler,
      });
      const payload = {
        name,
        category,
        dojoId,
        alternativeReference,
        users: [member, supervisor],
      };

      // ACT
      const res = await controllers.post(creatorMock, payload, eventId);

      // First, save the project
      expect(mockProjectModel).to.have.been.calledTwice;
      expect(mockProjectModel.getCall(0).args[0]).to.be.eql({
        eventId,
        name,
        category,
        dojoId,
        alternativeReference,
      });
      expect(mockProjectSave).to.have.been.calledOnce;

      // Then retrieve existing user(s)
      expect(mockUserHandler.get).to.have.been.calledOnce;
      expect(mockUserHandler.get).to.have.been.calledWith({ email: supervisor.email });
      expect(mockUserModel).to.have.been.calledWith(extend(omit(supervisor, ['type']), { id: 'user2' }));

      // Then save the (potentially new) users
      expect(mockUserModel).to.have.been.calledWith(omit(member, ['type']));
      expect(mockUserSaveMember).to.have.been.calledOnce;
      expect(mockUserSaveSupervisor).to.have.been.calledOnce;
      expect(mockUserModel).to.have.been.calledTwice;

      // Then save the associations
      expect(mockProjectModel.getCall(1).args[0]).to.be.eql({ id: 'project' });
      expect(mockMembersProject).to.have.been.calledOnce;
      expect(mockAttachProject).to.have.been.calledOnce;
      expect(mockAttachProject).to.have.been.calledWith([
        { user_id: 'user1', type: 'member' },
        { user_id: 'user2', type: 'supervisor' },
        { user_id: 'userX', type: 'owner' },
      ]);

      // Finally return the project/JSON
      expect(res).to.be.eql({ id: 'project', users: [{ id: 'user1', type: 'member' }, { id: 'user2', type: 'supervisor' }] });
      expect(res.users.map(user => user.type)).to.not.include('owner');
    });

    it('should call propagate err on erroneous behavior', async () => {
      // DATA
      const eventId = 'eventId';
      const name = 'MyLittleProject';
      const category = 'Flash';
      const dojoId = '';
      const err = new Error('Fake err');

      // STUBs
      const mockProjectSave = sandbox.stub().rejects(err);
      const mockUserModel = sandbox.stub().returns({});
      const mockProjectModel = sandbox.stub().returns({
        save: mockProjectSave,
      });
      const controllers = proxy('../../../controllers/projects', {
        '../models/user': mockUserModel,
        '../models/project': mockProjectModel,
        './users': {},
      });
      const payload = {
        name,
        category,
        dojoId,
        users: [],
      };

      // ACT
      try {
        await controllers.post(creatorMock, payload, eventId);
      } catch (_err) {
        // First, save the project
        expect(mockProjectModel).to.have.been.calledOnce;
        expect(mockProjectModel).to.have.been.calledWith({
          eventId,
          name,
          category,
          dojoId,
        });
        expect(mockProjectSave).to.have.been.calledOnce;

        // Finally return the err
        expect(_err.message).to.equal(_err.message);
      }
    });
  });

  describe('update', () => {
    let controllers;
    const originalProject = {};
    before(() => {
      controllers = proxy('../../../controllers/projects', {
        '../models/user': {},
        '../models/project': {},
        './users': {},
      });
    });
    beforeEach(() => {
      originalProject.save = sandbox.stub();
    });
    afterEach(() => {
      sandbox.reset();
    });

    it('should update the current project fields based on the new ones', async () => {
      const project = { id: 'fake', answers: { social_project: true } };
      originalProject.save.resolves(project);
      const res = await controllers.update(originalProject, project);
      expect(originalProject.save).to.have.been.calledWith(project, { method: 'update', patch: true });
      expect(res.id).to.equal(project.id);
    });
  });

  describe('get', () => {
    let controllers;
    const originalProject = {};
    let whereStub;
    before(() => {
      whereStub = sandbox.stub();
      controllers = proxy('../../../controllers/projects', {
        '../models/user': {},
        '../models/project': { where: whereStub },
        './users': {},
      });
    });
    beforeEach(() => {
      originalProject.save = sandbox.stub();
    });
    afterEach(() => {
      sandbox.reset();
    });

    it('should retrieve a project and its relations', async () => {
      const fetch = sinon.stub();
      whereStub.returns({ fetch });
      await controllers.get({ id: 'fakeId' }, ['bla']);
      expect(whereStub).to.have.been.calledWith({ id: 'fakeId' });
      expect(fetch.getCall(0).args[0]).to.be.eql({ withRelated: ['bla'] });
    });
  });
});
