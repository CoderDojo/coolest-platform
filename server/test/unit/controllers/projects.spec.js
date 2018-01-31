const proxy = require('proxyquire').noCallThru();
const {
  omit, extend, differenceWith, intersectionWith,
} = require('lodash');

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
      const description = 'MyLittleProject is awesome';
      const org = 'Code Club';
      const orgRef = 'Cambridge';
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
        description,
        org,
        orgRef,
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
        description,
        org,
        orgRef,
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
      const org = 'coderdojo';
      const orgRef = '358784b6-79e2-4e43-80a4-792da79f5418';
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
        org,
        orgRef,
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
          org,
          orgRef,
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

  describe('getMissingUsers', () => {
    let controllers;
    const projectModel = {};
    let differenceWithSpy;
    let intersectionWithSpy;
    before(() => {
      differenceWithSpy = sandbox.spy(differenceWith);
      intersectionWithSpy = sandbox.spy(intersectionWith);
      controllers = proxy('../../../controllers/projects', {
        '../models/user': {},
        '../models/project': projectModel,
        './users': {},
        lodash: {
          differenceWith: differenceWithSpy,
          intersectionWith: intersectionWithSpy,
        },
      });
    });
    afterEach(() => {
      sandbox.reset();
    });
    it('should return the missing user', () => {
      const originalUsers = [{ id: '1' }];
      const newUsers = [{ type: 'member' }];
      const association = [{ userId: '1' }];

      const res = controllers.getMissingUsers(originalUsers, newUsers, association);
      expect(differenceWithSpy).to.have.been.calledOnce;
      expect(intersectionWithSpy).to.have.been.calledOnce;
      expect(res).to.eql(['1']);
    });
    it('should return empty', () => {
      const originalUsers = [];
      const newUsers = [];
      const association = [];

      const res = controllers.getMissingUsers(originalUsers, newUsers, association);
      expect(differenceWithSpy).to.have.been.calledOnce;
      expect(intersectionWithSpy).to.have.been.calledOnce;
      expect(res).to.eql([]);
    });
    it('should not return an owner', () => {
      const originalUsers = [{ id: 1 }];
      const newUsers = [];
      const association = [{ userId: '1', type: 'owner' }];

      const res = controllers.getMissingUsers(originalUsers, newUsers, association);
      expect(differenceWithSpy).to.have.been.calledOnce;
      expect(intersectionWithSpy).to.have.been.calledOnce;
      expect(res).to.eql([]);
    });
  });

  describe('removeUsers', () => {
    let controllers;
    const projectUsers = {};
    before(() => {
      controllers = proxy('../../../controllers/projects', {
        '../models/user': {},
        '../models/project': {},
        '../models/projectUsers': projectUsers,
        './users': {},
      });
    });
    it('should query the proper user relation', async () => {
      const userIds = [];
      const projectId = '1';
      projectUsers.where = sinon.stub().returns(projectUsers);
      projectUsers.fetchAll = sinon.stub().resolves([]);

      await controllers.removeUsers(projectId, userIds);
      expect(projectUsers.where).to.have.been.calledThrice;
      expect(projectUsers.where.getCall(0)).to.have.been.calledWith('user_id', 'IN', userIds);
      expect(projectUsers.where.getCall(1)).to.have.been.calledWith('project_id', '=', projectId);
      expect(projectUsers.where.getCall(2)).to.have.been.calledWith('type', '!=', 'owner');
      expect(projectUsers.fetchAll).to.have.been.calledOnce;
    });
    it('should destroy every model from the response', async () => {
      const userIds = ['1'];
      const projectId = '1';
      const destroy = sinon.stub();
      projectUsers.where = sinon.stub().returns(projectUsers);
      projectUsers.fetchAll = sinon.stub().resolves([{ id: '1', destroy }]);

      await controllers.removeUsers(projectId, userIds);
      expect(projectUsers.where).to.have.been.calledThrice;
      expect(projectUsers.where.getCall(0)).to.have.been.calledWith('user_id', 'IN', userIds);
      expect(projectUsers.where.getCall(1)).to.have.been.calledWith('project_id', '=', projectId);
      expect(projectUsers.where.getCall(2)).to.have.been.calledWith('type', '!=', 'owner');
      expect(projectUsers.fetchAll).to.have.been.calledOnce;
      expect(destroy).to.have.been.calledOnce;
    });
  });

  describe('getExtended', () => {
    let controllers;
    const projectInstance = {};
    // eslint-disable-next-line func-style
    const projectModel = function () { return projectInstance; };
    before(() => {
      controllers = proxy('../../../controllers/projects', {
        '../models/user': {},
        '../models/project': projectModel,
        './users': {},
      });
    });
    it('should fetch Page with default params', async () => {
      projectInstance.orderBy = sinon.stub().returns(projectInstance);
      projectInstance.fetchPage = sinon.stub().returns(projectInstance);
      projectInstance.joinView = sinon.stub().returns(projectInstance);
      projectInstance.query = sinon.stub().returns(projectInstance);
      projectInstance.andWhere = sinon.stub().returns(projectInstance);
      projectInstance.query = sinon.stub()
        .callsArgWith(0, projectInstance)
        .returns(projectInstance);

      await controllers.getExtended({ scopes: { event_id: 'event1' } }, true);
      expect(projectInstance.joinView).to.have.been.calledOnce;
      expect(projectInstance.joinView).to.have.been.calledWith(undefined);
      expect(projectInstance.andWhere).to.have.been.calledOnce;
      expect(projectInstance.andWhere).to.have.been.calledWith('event_id', '=', 'event1');
      expect(projectInstance.orderBy).to.have.been.calledWith('created_at', 'desc');
      expect(projectInstance.fetchPage).to.have.been.calledWith({ pageSize: 25, page: 1, withRelated: ['owner', 'supervisor', 'members'] });
    });
    it('should accept params to customize the search', async () => {
      projectInstance.where = sinon.stub().returns(projectInstance);
      projectInstance.orderBy = sinon.stub().returns(projectInstance);
      projectInstance.fetchPage = sinon.stub().returns(projectInstance);
      projectInstance.joinView = sinon.stub().returns(projectInstance);
      projectInstance.andWhere = sinon.stub().returns(projectInstance);
      projectInstance.query = sinon.stub()
        .callsArgWith(0, projectInstance)
        .returns(projectInstance);

      await controllers.getExtended({
        orderBy: 'bananaSplit',
        ascending: '1',
        query: {
          name: 'aa',
        },
        scopes: {
          event_id: 'event1',
          'owner.id': 'user1',
        },
        page: 2,
        limit: 30,
      }, true);
      expect(projectInstance.joinView).to.have.been.calledOnce;
      expect(projectInstance.joinView).to.have.been.calledWith({ name: 'aa' });
      expect(projectInstance.andWhere).to.have.been.calledTwice;
      expect(projectInstance.andWhere.getCall(0)).to.have.been.calledWith('event_id', '=', 'event1');
      expect(projectInstance.andWhere.getCall(1)).to.have.been.calledWith('owner.id', '=', 'user1');
      expect(projectInstance.orderBy).to.have.been.calledWith('banana_split', 'asc');
      expect(projectInstance.fetchPage).to.have.been.calledWith({ pageSize: 30, page: 2, withRelated: ['owner', 'supervisor', 'members'] });
    });
    it('should ignore pagination by default', async () => {
      projectInstance.where = sinon.stub().returns(projectInstance);
      projectInstance.orderBy = sinon.stub().returns(projectInstance);
      projectInstance.fetchAll = sinon.stub().returns(projectInstance);
      projectInstance.joinView = sinon.stub().returns(projectInstance);
      projectInstance.query = sinon.stub().returns(projectInstance);

      await controllers.getExtended({
        orderBy: 'banana',
        ascending: '1',
        query: {
          name: 'aa',
        },
        scopes: {
          event_id: 'event1',
        },
        page: 2,
        limit: 30,
      });
      expect(projectInstance.joinView).to.have.been.calledOnce;
      expect(projectInstance.joinView).to.have.been.calledWith({ name: 'aa' });
      expect(projectInstance.orderBy).to.have.been.calledWith('banana', 'asc');
      expect(projectInstance.fetchAll).to.have.been.calledWith({ withRelated: ['owner', 'supervisor', 'members'] });
    });
  });
});
