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
      expect(getController).to.have.been.calledWith({ id }, ['owner']);
      expect(mockReq.app.locals.project).to.equal(res);
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
});
