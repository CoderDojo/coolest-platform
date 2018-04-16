const proxy = require('proxyquire').noCallThru();
const _ = require('lodash');

describe('router: project', () => {
  let handlers;
  describe('post', () => {
    let sandbox;
    let handler;
    const projectController = class {};
    let mailingStub;
    let loggerStub;
    let statusStub;
    let jsonStub;
    let nextMock;
    let errorHandler;
    before(() => {
      sandbox = sinon.sandbox.create();
      handlers = (proxy('../../../routes/handlers/projects', {
        '../../controllers/projects': projectController,
      })).post;
      loggerStub = sandbox.stub();
      jsonStub = sandbox.stub();
      errorHandler = sandbox.stub();
      handler = (req, res, next) => {
        return handlers[0](req, res, next)
          .then(() => handlers[1](req, res, next))
          .then(() => handlers[2](req, res, next))
          .catch(err => errorHandler(err));
      };
    });

    beforeEach(() => {
      sandbox.reset();
      statusStub = sandbox.stub().returns({
        json: jsonStub,
      });
      mailingStub = sandbox.stub().resolves();
      nextMock = sandbox.stub().callsFake((err, data) => {
        if (err) return Promise.reject(err);
        return Promise.resolve(data);
      });
    });

    it('should send an email on project creation', async () => {
      const postController = sandbox.stub();
      const mockProject = { id: 'project1', name: 'MyPoneyProject', users: [] };
      const mockReq = {
        app: {
          locals: {
            mailing: {
              sendWelcomeEmail: mailingStub,
            },
            event: {
              attributes: {
                name: 'cp int 2018',
              },
              formattedDate: sandbox.stub().returns('Friday the 6th'),
            },
          },
        },
        user: { userId: 'userX', user: { id: 'userX' } },
        body: mockProject,
        params: { eventId: 'event1' },
      };
      const mockRes = {
        status: statusStub,
        locals: {},
      };
      const mockEvent = {
        name: 'cp int 2018',
        date: 'Friday the 6th',
      };
      projectController.post = postController.resolves(mockProject);
      await handler(mockReq, mockRes, nextMock);
      expect(postController).to.have.been.calledWith(
        mockReq.user.user,
        mockProject,
        mockReq.params.eventId,
      );
      expect(mailingStub).to.have.been.calledOnce;
      expect(mailingStub).to.have.been.calledWith(mockReq.user.user, mockProject, mockEvent);
      expect(nextMock).to.have.been.calledTwice;
    });

    it('should format to json', async () => {
      const postController = sandbox.stub();
      const mockProject = { id: 'project1', name: 'MyPoneyProject', users: [] };
      const mockReq = {
        app: {
          locals: {
            mailing: {
              sendWelcomeEmail: mailingStub,
            },
            event: {
              attributes: {
                name: 'cp int 2018',
              },
              formattedDate: sandbox.stub().returns('Friday the 6th'),
            },
          },
        },
        user: { userId: 'userX', user: { id: 'userX' } },
        body: mockProject,
        params: { eventId: 'event1' },
      };
      const mockRes = {
        status: statusStub,
        locals: {},
      };
      projectController.post = postController.resolves(mockProject);
      await handler(mockReq, mockRes, nextMock);
      expect(postController).to.have.been.calledWith(
        mockReq.user.user,
        mockProject,
        mockReq.params.eventId,
      );
      expect(mailingStub).to.have.been.calledOnce;

      expect(statusStub).to.have.been.calledOnce;
      expect(statusStub).to.have.been.calledWith(200);
      expect(jsonStub).to.have.been.calledOnce;
      expect(jsonStub).to.have.been.calledWith(mockProject);
      expect(nextMock).to.have.been.calledTwice;
    });

    it('should not send an email on project creation failure', async () => {
      const postController = sandbox.stub();
      const mockProject = { id: 'project1', name: 'MyPoneyProject', users: [] };
      const mockReq = {
        app: {
          locals: {
            mailing: {
              sendWelcomeEmail: mailingStub,
            },
            logger: {
              error: loggerStub,
            },
          },
        },
        user: { userId: 'userX', user: { id: 'userX' } },
        body: mockProject,
        params: { eventId: 'event1' },
      };
      const mockRes = {
        status: statusStub,
        locals: {},
      };
      projectController.post = postController.rejects();
      await handler(mockReq, mockRes, nextMock);
      expect(postController).to.have.been.calledWith(
        mockReq.user.user,
        mockProject,
        mockReq.params.eventId,
      );
      expect(mailingStub).to.not.have.been.called;
      expect(errorHandler.getCall(0).args[0].message).to.equal('Error while saving your project.');
      expect(nextMock).to.have.been.calledOnce;
    });

    it('should log specific error triggered by the controller', async () => {
      const postController = sandbox.stub();
      const mockProject = { id: 'project1', name: 'MyPoneyProject', users: [] };
      const mockErr = new Error('Fake err');
      const mockReq = {
        app: {
          locals: {
            mailing: {
              sendWelcomeEmail: mailingStub,
            },
            logger: {
              error: loggerStub,
            },
          },
        },
        user: { userId: 'userX', user: { id: 'userX' } },
        body: mockProject,
        params: { eventId: 'event1' },
      };
      const mockRes = {
        status: statusStub,
        locals: {},
      };
      projectController.post = postController.rejects(mockErr);
      await handler(mockReq, mockRes, nextMock);
      expect(postController).to.have.been.calledWith(
        mockReq.user.user,
        mockProject,
        mockReq.params.eventId,
      );
      expect(mailingStub).to.not.have.been.called;
      expect(loggerStub).to.have.been.calledOnce;
      expect(loggerStub.getCall(0).args[0].message).to.be.equal('Fake err');
      expect(nextMock).to.have.been.calledOnce;
    });
  });
  describe('param', () => {
    let handler;
    const projectController = class {};
    let sandbox;
    before(() => {
      sandbox = sinon.sandbox.create();
      handler = (proxy('../../../routes/handlers/projects', {
        '../../controllers/projects': projectController,
      })).param;
    });


    it('should associate the project to the locals', async () => {
      const getController = sandbox.stub();
      const id = 'faaa';
      const res = { id, name: 'proj' };
      projectController.get = getController.resolves(res);
      const nextMock = sandbox.stub();
      const mockReq = {
        app: {
          locals: {},
        },
      };
      await handler(mockReq, {}, nextMock, id);
      expect(getController).to.have.been.calledOnce;
      expect(getController).to.have.been.calledWith({ id }, ['owner', 'supervisor', 'members']);
      expect(mockReq.app.locals.project).to.equal(res);
    });
  });

  describe('get :id', () => {
    let handler;
    const projectController = class {};
    let sandbox;

    before(() => {
      sandbox = sinon.sandbox.create();
      handlers = (proxy('../../../routes/handlers/projects', {
        '../../controllers/projects': projectController,
      })).get;
      handler = (req, res, next) => {
        return handlers[0](req, res, next);
      };
    });

    it('should return the project for given event id and project id', async () => {
      const mockReq = {
        app: {
          locals: { project: 'foo' },
        },
      };
      const json = sandbox.stub();
      const mockRes = {
        status: sandbox.stub().returns({ json }),
      };

      await handler(mockReq, mockRes);

      expect(mockRes.status).to.have.been.calledOnce;
      expect(mockRes.status).to.have.been.calledWith(200);
      expect(json).to.have.been.calledOnce;
      expect(json).to.have.been.calledWith('foo');
    });
  });

  describe('GET /', () => {
    let handler;
    const projectController = class {};
    const sandbox = sinon.sandbox.create();

    before(() => {
      handlers = (proxy('../../../routes/handlers/projects', {
        '../../controllers/projects': projectController,
      })).getAll;
      handler = (req, res, next) => {
        return handlers[0](req, res, next);
      };
      projectController.getExtended = sandbox.stub();
    });

    beforeEach(() => {
      sandbox.reset();
    });

    it('should return a list of projects as json', async () => {
      const mockReq = {
        params: { eventId: '111' },
        query: { orderBy: 'banana' },
        accepts: sinon.stub().returns(false),
        get: sinon.stub().returns(false),
      };
      const json = sandbox.stub();
      const mockRes = {
        status: sandbox.stub().returns({ json }),
      };
      const res = {
        models: [],
        pagination: {
          rowCount: 0,
        },
      };
      const mockQuery = mockReq.query;
      mockQuery.event_id = mockReq.params;
      projectController.getExtended.resolves(res);
      await handler(mockReq, mockRes);

      expect(mockRes.status).to.have.been.calledOnce;
      expect(mockRes.status).to.have.been.calledWith(200);
      expect(projectController.getExtended).to.have.been.calledOnce;
      expect(projectController.getExtended).to.have.been.calledWith(
        mockQuery,
        true,
      );
      expect(json).to.have.been.calledOnce;
      expect(json).to.have.been.calledWith({ count: 0, data: [] });
    });

    it('should return a list of projects as csv when passed the format parameter', async () => {
      const mockReq = {
        params: { eventId: '111' },
        query: { orderBy: 'banana', format: 'csv' },
        accepts: sandbox.stub().returns(false),
        get: sinon.stub().returns(false),
      };
      const send = sandbox.stub();
      const mockRes = {
        setHeader: sandbox.stub(),
        status: sandbox.stub().returns({ send }),
      };
      const res = {
        models: [],
        pagination: {
          rowCount: 0,
        },
        toJSON: sandbox.stub(),
      };
      const mockQuery = mockReq.query;
      mockQuery.event_id = mockReq.params;
      res.toJSON.returns(res.models);
      projectController.getExtended.resolves(res);
      await handler(mockReq, mockRes);

      expect(mockRes.status).to.have.been.calledOnce;
      expect(mockRes.status).to.have.been.calledWith(200);
      expect(projectController.getExtended).to.have.been.calledOnce;
      expect(projectController.getExtended).to.have.been.calledWith(mockQuery, false);
      expect(mockRes.setHeader).to.have.been.calledOnce;
      expect(mockRes.setHeader).to.have.been.calledWith('Content-Type', 'text/csv');
      expect(send).to.have.been.calledOnce;
      expect(send).to.have.been.calledWith('"Name","Description","Category","Owner Email","Created At","Updated At","Supervisor First Name","Supervisor Last Name","Supervisor Email","Supervisor Phone","Participant 1 First Name","Participant 1 Last Name","Participant 1 Dob","Participant 1 Gender","Participant 1 Special requirements","Participant 2 First Name","Participant 2 Last Name","Participant 2 Dob","Participant 2 Gender","Participant 2 Special requirements","Participant 3 First Name","Participant 3 Last Name","Participant 3 Dob","Participant 3 Gender","Participant 3 Special requirements","Participant 4 First Name","Participant 4 Last Name","Participant 4 Dob","Participant 4 Gender","Participant 4 Special requirements","Participant 5 First Name","Participant 5 Last Name","Participant 5 Dob","Participant 5 Gender","Participant 5 Special requirements"');
    });

    it('should format data for csv', async () => {
      const mockReq = {
        params: { eventId: '111' },
        query: { orderBy: 'banana', format: 'csv' },
        accepts: sandbox.stub().returns(false),
        get: sinon.stub().returns(false),
      };
      const send = sandbox.stub();
      const mockRes = {
        setHeader: sandbox.stub(),
        status: sandbox.stub().returns({ send }),
      };
      const res = {
        models: [
          {
            name: 'Desu',
            description: 'Blah blah blah',
            category: 'HTML',
            owner: {
              email: 'test@test.com',
            },
            supervisor: {
              email: 'sup@sup.com',
              firstName: 'Sup first',
              lastName: 'Sup last',
              phone: '1234',
            },
            members: [1, 2, 3, 4, 5].map((i) => {
              return {
                firstName: `Foo ${i}`,
                lastName: `Bar ${i}`,
                dob: `DOB ${i}`,
                gender: `Gender ${i}`,
                specialRequirements: `sr ${i}`,
              };
            }),
            createdAt: 1516358474342,
            updatedAt: 1516358474342,
          },
        ],
        pagination: {
          rowCount: 0,
        },
        toJSON: sandbox.stub(),
      };
      const mockQuery = mockReq.query;
      mockQuery.event_id = mockReq.params;
      res.toJSON.returns(res.models);
      projectController.getExtended.resolves(res);
      await handler(mockReq, mockRes);

      expect(mockRes.status).to.have.been.calledOnce;
      expect(mockRes.status).to.have.been.calledWith(200);
      expect(projectController.getExtended).to.have.been.calledOnce;
      expect(projectController.getExtended).to.have.been.calledWith(mockQuery, false);
      expect(mockRes.setHeader).to.have.been.calledOnce;
      expect(mockRes.setHeader).to.have.been.calledWith('Content-Type', 'text/csv');
      expect(send).to.have.been.calledOnce;
      expect(send).to.have.been.calledWith('"Name","Description","Category","Owner Email","Created At","Updated At","Supervisor First Name","Supervisor Last Name","Supervisor Email","Supervisor Phone","Participant 1 First Name","Participant 1 Last Name","Participant 1 Dob","Participant 1 Gender","Participant 1 Special requirements","Participant 2 First Name","Participant 2 Last Name","Participant 2 Dob","Participant 2 Gender","Participant 2 Special requirements","Participant 3 First Name","Participant 3 Last Name","Participant 3 Dob","Participant 3 Gender","Participant 3 Special requirements","Participant 4 First Name","Participant 4 Last Name","Participant 4 Dob","Participant 4 Gender","Participant 4 Special requirements","Participant 5 First Name","Participant 5 Last Name","Participant 5 Dob","Participant 5 Gender","Participant 5 Special requirements"\n"Desu","Blah blah blah","HTML","test@test.com","2018-1-19","2018-1-19","Sup first","Sup last","sup@sup.com","1234","Foo 1","Bar 1","DOB 1","Gender 1","sr 1","Foo 2","Bar 2","DOB 2","Gender 2","sr 2","Foo 3","Bar 3","DOB 3","Gender 3","sr 3","Foo 4","Bar 4","DOB 4","Gender 4","sr 4","Foo 5","Bar 5","DOB 5","Gender 5","sr 5"');
    });
  });

  describe('put', () => {
    let handler;
    const projectController = class {};
    const userController = class {};
    let sandbox;
    let errorHandler;
    before(() => {
      sandbox = sinon.sandbox.create();
      handlers = (proxy('../../../routes/handlers/projects', {
        '../../controllers/projects': projectController,
        '../../controllers/users': userController,
      })).put;
      errorHandler = sandbox.stub();
      handler = (req, res, next) => {
        return handlers[0](req, res, next)
          .then(() => handlers[1](req, res, next))
          .then(() => handlers[2](req, res, next))
          .then(() => handlers[3](req, res, next))
          .catch(err => errorHandler(err));
      };
    });
    it('should update the project and its users', async () => {
      const id = 'faaa';
      const newUsers = [{ id: '2', type: 'member' }, { type: 'member' }];
      const origUsers = [];
      const userAssociations = [{ id: 'x', userId: '1', type: 'owner' }, { id: 'xx', userId: '2', type: 'member' }];
      const originalProject = { id, name: 'oldproj', users: origUsers };
      const newProject = { id: 'faa2', name: 'proj', users: newUsers };
      const res = Object.assign({}, newProject, { id }, { users: origUsers });
      const resModel = Object.assign({}, res);
      const usersCollection = { attach: sandbox.stub() };
      const jsonModel = Object.assign({}, res, { userAssociations });
      const refreshedModel = Object.assign(
        {},
        jsonModel,
        { users: sandbox.stub(), toJSON: sandbox.stub() },
      );
      resModel.refresh = sandbox.stub().resolves(refreshedModel);
      refreshedModel.refresh = sandbox.stub().resolves(refreshedModel);
      refreshedModel.toJSON.returns(jsonModel);
      usersCollection.attach.returns(refreshedModel);
      refreshedModel.users.returns(usersCollection);
      originalProject.refresh = sandbox.stub().resolves(originalProject);
      originalProject.toJSON = sandbox.stub().returns(originalProject);
      projectController.update = sandbox.stub().resolves(resModel);
      projectController.getMissingUsers = sandbox.stub().returns([]);
      projectController.removeUsers = sandbox.stub().resolves(resModel);
      projectController.get = sandbox.stub().resolves(refreshedModel);
      userController.removeUsers = sandbox.stub().resolves();
      userController.save = sandbox.stub().callsFake(u => Promise.resolve(Object.assign({}, { id: '5' }, u)));
      const nextMock = sandbox.stub();
      const mockReq = {
        params: { id },
        body: newProject,
        app: {
          locals: {
            project: originalProject,
          },
        },
      };
      const json = sandbox.stub();
      const mockRes = {
        locals: {},
        status: sandbox.stub().returns({ json }),
      };
      await handler(mockReq, mockRes, nextMock);
      // Handler 1: save project
      expect(projectController.update).to.have.been.calledOnce;
      expect(projectController.update).to.have.been.calledWith(originalProject, _.omit(res, ['users']));
      expect(resModel.refresh).to.have.been.calledOnce;
      expect(resModel.refresh).to.have.been.calledWith({ withRelated: ['users', 'userAssociations'] });
      // Handler 2: delete missing users
      expect(projectController.getMissingUsers).to.have.been.calledOnce;
      expect(projectController.getMissingUsers).to.have.been.calledWith(
        origUsers,
        newUsers,
        userAssociations,
      );
      expect(projectController.removeUsers).to.have.been.calledWith(id, []);
      expect(userController.removeUsers).to.have.been.calledWith([]);
      // Handler 3: save (new) users
      expect(userController.save).to.have.been.calledTwice;
      // One update of existing user, one creation of a new user
      expect(usersCollection.attach).to.have.been.calledOnce;
      // Handler 4: Refresh and format
      expect(projectController.get).to.have.been.calledOnce;
      expect(projectController.get).to.have.been.calledWith({ id }, ['users']);
      expect(mockRes.locals.project).to.eql(refreshedModel);
      expect(mockRes.status).to.have.been.calledOnce;
      expect(mockRes.status).to.have.been.calledWith(200);
      expect(json).to.have.been.calledOnce;
      expect(json).to.have.been.calledWith(refreshedModel);
      expect(nextMock).to.have.been.calledThrice;
    });

    it('should exclude the update of the owner and user with ids which are not part of the project', async () => {
      const id = 'faaa';
      const newUsers = [{ id: '2', type: 'member' }, { id: 'wizard', type: 'owner' }];
      const origUsers = [];
      const userAssociations = [{ id: 'x', userId: '1', type: 'owner' }];
      const originalProject = { id, name: 'oldproj', users: origUsers };
      const newProject = { id: 'faa2', name: 'proj', users: newUsers };
      const res = Object.assign({}, newProject, { id }, { users: origUsers });
      const resModel = Object.assign({}, res);
      const usersCollection = { attach: sandbox.stub() };
      const jsonModel = Object.assign({}, res, { userAssociations });
      const refreshedModel = Object.assign(
        {},
        jsonModel,
        { users: sandbox.stub(), toJSON: sandbox.stub() },
      );
      resModel.refresh = sandbox.stub().resolves(refreshedModel);
      refreshedModel.refresh = sandbox.stub().resolves(refreshedModel);
      refreshedModel.toJSON.returns(jsonModel);
      usersCollection.attach.returns(refreshedModel);
      refreshedModel.users.returns(usersCollection);
      originalProject.refresh = sandbox.stub().resolves(originalProject);
      originalProject.toJSON = sandbox.stub().returns(originalProject);
      projectController.update = sandbox.stub().resolves(resModel);
      projectController.getMissingUsers = sandbox.stub().returns([]);
      projectController.removeUsers = sandbox.stub().resolves(resModel);
      projectController.get = sandbox.stub().resolves(refreshedModel);
      userController.removeUsers = sandbox.stub().resolves();
      userController.save = sandbox.stub().callsFake(u => Promise.resolve(Object.assign({}, { id: '5' }, u)));
      const nextMock = sandbox.stub();
      const mockReq = {
        params: { id },
        body: newProject,
        app: {
          locals: {
            project: originalProject,
          },
        },
      };
      const json = sandbox.stub();
      const mockRes = {
        locals: {},
        status: sandbox.stub().returns({ json }),
      };
      await handler(mockReq, mockRes, nextMock);
      // Handler 1: save project
      expect(projectController.update).to.have.been.calledOnce;
      expect(projectController.update).to.have.been.calledWith(originalProject, _.omit(res, ['users']));
      expect(resModel.refresh).to.have.been.calledOnce;
      expect(resModel.refresh).to.have.been.calledWith({ withRelated: ['users', 'userAssociations'] });
      // Handler 2: delete missing users
      expect(projectController.getMissingUsers).to.have.been.calledOnce;
      expect(projectController.getMissingUsers).to.have.been.calledWith(
        origUsers,
        newUsers,
        userAssociations,
      );
      expect(projectController.removeUsers).to.have.been.calledWith(id, []);
      expect(userController.removeUsers).to.have.been.calledWith([]);
      // Handler 3: save (new) users
      expect(userController.save).to.not.have.been.called;
      expect(usersCollection.attach).to.not.have.been.called;
      // Handler 4: Refresh and format
      expect(projectController.get).to.have.been.calledOnce;
      expect(projectController.get).to.have.been.calledWith({ id }, ['users']);
      expect(mockRes.locals.project).to.eql(refreshedModel);
      expect(mockRes.status).to.have.been.calledOnce;
      expect(mockRes.status).to.have.been.calledWith(200);
      expect(json).to.have.been.calledOnce;
      expect(json).to.have.been.calledWith(refreshedModel);
      expect(nextMock).to.have.been.calledThrice;
    });
    it('should delete a user', async () => {
      const id = 'faaa';
      const newUsers = [{ type: 'member' }];
      const origUsers = [{ id: '3' }];
      const userAssociations = [{ id: 'x', userId: '1', type: 'owner' }, { id: 'xx', userId: '3' }];
      const userToBeRemoved = [{ id: '3' }];
      const originalProject = { id, name: 'oldproj', users: origUsers };
      const newProject = { id: 'faa2', name: 'proj', users: newUsers };
      const res = Object.assign({}, newProject, { id }, { users: origUsers });
      const resModel = Object.assign({}, res);
      const usersCollection = { attach: sandbox.stub() };
      const jsonModel = Object.assign({}, res, { userAssociations });
      const refreshedModel = Object.assign(
        {},
        jsonModel,
        { users: sandbox.stub(), toJSON: sandbox.stub() },
      );
      resModel.refresh = sandbox.stub().resolves(refreshedModel);
      refreshedModel.refresh = sandbox.stub().resolves(refreshedModel);
      refreshedModel.toJSON.returns(jsonModel);
      usersCollection.attach.returns(refreshedModel);
      refreshedModel.users.returns(usersCollection);
      originalProject.refresh = sandbox.stub().resolves(originalProject);
      originalProject.toJSON = sandbox.stub().returns(originalProject);
      projectController.update = sandbox.stub().resolves(resModel);
      projectController.getMissingUsers = sandbox.stub().returns(userToBeRemoved);
      projectController.removeUsers = sandbox.stub().resolves(resModel);
      projectController.get = sandbox.stub().resolves(refreshedModel);
      userController.removeUsers = sandbox.stub().resolves();
      userController.save = sandbox.stub().callsFake(u => Promise.resolve(Object.assign({}, { id: '5' }, u)));
      const nextMock = sandbox.stub();
      const mockReq = {
        params: { id },
        body: newProject,
        app: {
          locals: {
            project: originalProject,
          },
        },
      };
      const json = sandbox.stub();
      const mockRes = {
        locals: {},
        status: sandbox.stub().returns({ json }),
      };
      await handler(mockReq, mockRes, nextMock);
      // Handler 1: save project
      expect(projectController.update).to.have.been.calledOnce;
      expect(projectController.update).to.have.been.calledWith(originalProject, _.omit(res, ['users']));
      expect(resModel.refresh).to.have.been.calledOnce;
      expect(resModel.refresh).to.have.been.calledWith({ withRelated: ['users', 'userAssociations'] });
      // Handler 2: delete missing users
      expect(projectController.getMissingUsers).to.have.been.calledOnce;
      expect(projectController.getMissingUsers).to.have.been.calledWith(
        origUsers,
        newUsers,
        userAssociations,
      );
      expect(projectController.removeUsers).to.have.been.calledWith(id, userToBeRemoved);
      expect(userController.removeUsers).to.have.been.calledWith(userToBeRemoved);
      // Handler 3: save (new) users
      expect(userController.save).to.have.been.calledOnce;
      // One update of existing user, one creation of a new user
      expect(usersCollection.attach).to.have.been.calledOnce;
      // Handler 4: Refresh and format
      expect(projectController.get).to.have.been.calledOnce;
      expect(projectController.get).to.have.been.calledWith({ id }, ['users']);
      expect(mockRes.locals.project).to.eql(refreshedModel);
      expect(mockRes.status).to.have.been.calledOnce;
      expect(mockRes.status).to.have.been.calledWith(200);
      expect(json).to.have.been.calledOnce;
      expect(json).to.have.been.calledWith(refreshedModel);
      expect(nextMock).to.have.been.calledThrice;
      expect(userController.save).to.have.been.calledWith(newUsers[0]);
    });
  });

  describe('patch', () => {
    let handler;
    const projectController = class {};
    let sandbox;
    let errorHandler;
    before(() => {
      sandbox = sinon.sandbox.create();
      handlers = (proxy('../../../routes/handlers/projects', {
        '../../controllers/projects': projectController,
      })).patch;
      errorHandler = sandbox.stub();
      handler = (req, res, next) => {
        return handlers[0](req, res, next)
          .then(() => handlers[1](req, res, next))
          .catch(err => errorHandler(err));
      };
    });
    it('should save with the proper enforced project id', async () => {
      const updateController = sandbox.stub();
      const id = 'faaa';
      const res = { id, name: 'proj' };
      const originalProject = { id, name: 'oldproj' };
      const newProject = { id: 'faa2', name: 'proj' };
      projectController.update = updateController.resolves(res);
      const nextMock = sandbox.stub();
      const mockReq = {
        params: { id },
        body: newProject,
        app: {
          locals: {
            project: originalProject,
          },
        },
      };
      const json = sandbox.stub();
      const mockRes = {
        locals: {},
        status: sandbox.stub().returns({ json }),
      };
      await handler(mockReq, mockRes, nextMock);
      expect(updateController).to.have.been.calledOnce;
      expect(updateController).to.have.been.calledWith(originalProject, res);
      expect(mockRes.locals.project).to.equal(res);
      expect(mockRes.status).to.have.been.calledOnce;
      expect(mockRes.status).to.have.been.calledWith(200);
      expect(json).to.have.been.calledOnce;
      expect(json).to.have.been.calledWith(res);
    });

    it('should return an error', async () => {
      const updateController = sandbox.stub();
      const id = 'faaa';
      const originalProject = { id, name: 'oldproj' };
      const newProject = { name: 'proj' };
      const err = new Error('Fake err');
      projectController.update = updateController.rejects(err);
      const nextMock = sandbox.stub();
      const error = sandbox.stub();
      const mockReq = {
        params: { id },
        body: newProject,
        app: {
          locals: {
            project: originalProject,
            logger: { error },
          },
        },
      };
      const mockRes = {
        locals: {},
      };
      await handler(mockReq, mockRes, nextMock);
      expect(updateController).to.have.been.calledOnce;
      expect(updateController).to.have.been.calledWith(originalProject, { id, name: 'proj' });
      expect(nextMock).to.have.been.calledOnce;
      expect(nextMock.getCall(0).args[0].message).to.equal('Error while saving your project.');
    });
  });
  describe('/users/:uId/projects', () => {
    let handler;
    let sandbox;
    let errorHandler;
    const projectController = class {};
    before(() => {
      sandbox = sinon.sandbox.create();
      handlers = (proxy('../../../routes/handlers/projects', {
        '../../controllers/projects': projectController,
      })).getUserProjects;
      errorHandler = sandbox.stub();
      handler = (req, res, next) => {
        return handlers[0](req, res, next)
          .catch(err => errorHandler(err));
      };
    });

    it('should applies params', async () => {
      const getExtended = sandbox.stub();
      const json = sandbox.stub();
      const status = sandbox.stub().returns({ json });
      const next = sandbox.stub();
      const userId = 'user1';
      const eventId = 'event1';
      const mockResponse = {
        models: [],
        pagination: {
          rowCount: 0,
        },
      };
      projectController.getExtended = getExtended.resolves(mockResponse);
      const req = {
        user: {
          userId,
        },
        params: {
          eventId,
        },
      };
      const res = {
        status,
      };
      await handler(req, res, next);
      expect(getExtended).to.have.been.calledOnce;
      expect(getExtended).to.have.been.calledWith({ scopes: { 'owner.id': userId, event_id: eventId } });
      expect(status).to.have.been.calledOnce;
      expect(status).to.have.been.calledWith(200);
      expect(json).to.have.been.calledOnce;
      expect(json).to.have.been.calledWith({ data: [], count: 0 });
      expect(next).to.not.have.been.called;
    });
  });
});
