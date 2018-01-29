const proxy = require('proxyquire').noCallThru();

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
      expect(mailingStub).to.have.been.calledWith(mockReq.user.user, mockProject);
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
      expect(projectController.getExtended).to.have.been.calledWith(
        mockQuery,
        false,
      );
      expect(mockRes.setHeader).to.have.been.calledOnce;
      expect(mockRes.setHeader).to.have.been.calledWith('Content-Type', 'text/csv');
      expect(send).to.have.been.calledOnce;
      expect(send).to.have.been.calledWith('"Name","Description","Category","Supervisor Email","Owner Email","Created At","Updated At"');
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
        models: [{
          name: 'Desu',
          category: 'HTML',
          owner: {
            email: 'test@test.com',
          },
          supervisor: {
            email: 'sup@sup.com',
          },
          createdAt: 1516358474342,
          updatedAt: 1516358474342,
        }],
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
      expect(projectController.getExtended).to.have.been.calledWith(
        mockQuery,
        false,
      );
      expect(mockRes.setHeader).to.have.been.calledOnce;
      expect(mockRes.setHeader).to.have.been.calledWith('Content-Type', 'text/csv');
      expect(send).to.have.been.calledOnce;
      expect(send).to.have.been.calledWith('"Name","Description","Category","Supervisor Email","Owner Email","Created At","Updated At"\n"Desu",,"HTML","sup@sup.com","test@test.com","2018-1-19","2018-1-19"');
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
      await handler(mockReq, mockRes, nextMock, id);
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
      await handler(mockReq, mockRes, nextMock, id);
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
