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
        return handlers[1](req, res, next)
          .then(() => handlers[2](req, res, next))
          .then(() => handlers[3](req, res, next))
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
        body: mockProject,
        params: { eventId: 'event1' },
      };
      const mockRes = {
        status: statusStub,
        locals: {},
      };
      projectController.post = postController.resolves(mockProject);
      await handler(mockReq, mockRes, nextMock);
      expect(postController).to.have.been.calledWith(mockProject, mockReq.params.eventId);
      expect(mailingStub).to.have.been.calledOnce;
      expect(mailingStub).to.have.been.calledWith(mockProject);
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
        body: mockProject,
        params: { eventId: 'event1' },
      };
      const mockRes = {
        status: statusStub,
        locals: {},
      };
      projectController.post = postController.resolves(mockProject);
      await handler(mockReq, mockRes, nextMock);
      expect(postController).to.have.been.calledWith(mockProject, mockReq.params.eventId);
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
        body: mockProject,
        params: { eventId: 'event1' },
      };
      const mockRes = {
        status: statusStub,
        locals: {},
      };
      projectController.post = postController.rejects();
      await handler(mockReq, mockRes, nextMock);
      expect(postController).to.have.been.calledWith(mockProject, mockReq.params.eventId);
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
        body: mockProject,
        params: { eventId: 'event1' },
      };
      const mockRes = {
        status: statusStub,
        locals: {},
      };
      projectController.post = postController.rejects(mockErr);
      await handler(mockReq, mockRes, nextMock);
      expect(postController).to.have.been.calledWith(mockProject, mockReq.params.eventId);
      expect(mailingStub).to.not.have.been.called;
      expect(loggerStub).to.have.been.calledOnce;
      expect(loggerStub.getCall(0).args[0].message).to.be.equal('Fake err');
      expect(nextMock).to.have.been.calledOnce;
    });
  });
});
