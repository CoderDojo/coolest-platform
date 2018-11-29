const proxy = require('proxyquire').noCallThru();

describe('router: user', () => {
  let handlers;
  describe('post', () => {
    let sandbox;
    let handler;
    const userController = class {};
    const authController = class {};
    const eventController = class {};
    const event = {
      slug: 'cp-2018',
      contact: 'hello@coolestprojects.org',
    };
    let loggerStub;
    let statusStub;
    let jsonStub;
    let getController;
    let nextMock;
    let errorHandler;
    before(() => {
      sandbox = sinon.createSandbox();
      handlers = (proxy('../../../routes/handlers/users', {
        '../../controllers/users': userController,
        '../../controllers/auth': authController,
        '../../controllers/events': eventController,
      })).post;
      loggerStub = sandbox.stub();
      jsonStub = sandbox.stub();
      errorHandler = sandbox.stub();
      handler = (req, res, next) => {
        return handlers[0](req, res, next)
          .then(() => handlers[1](req, res, next))
          .then(() => handlers[2](req, res, next))
          .then(() => handlers[3](req, res, next))
          .then(() => handlers[4](req, res, next))
          .catch(err => errorHandler(err));
      };
    });

    beforeEach(() => {
      sandbox.reset();
      statusStub = sandbox.stub().returns({
        json: jsonStub,
      });
      nextMock = sandbox.stub().callsFake((err, data) => {
        if (err) return Promise.reject(err);
        return Promise.resolve(data);
      });
      getController = sandbox.stub();
      eventController.get = getController.resolves({ attributes: event });
    });

    it('should format to json', async () => {
      const postController = sandbox.stub();
      const getAllController = sandbox.stub();
      const mockUser = { email: 'text@example.com' };
      const mockAnswer = { user: mockUser, auth: {} };
      const mockReq = {
        body: mockUser,
      };
      const mockRes = {
        status: statusStub,
        locals: {},
      };
      userController.post = postController.resolves(mockAnswer);
      userController.getAll = getAllController.resolves([]);
      await handler(mockReq, mockRes, nextMock);
      expect(postController).to.have.been.calledOnce;
      expect(postController).to.have.been.calledWith({ email: mockReq.body.email });

      expect(statusStub).to.have.been.calledOnce;
      expect(statusStub).to.have.been.calledWith(200);
      expect(jsonStub).to.have.been.calledOnce;
      expect(jsonStub).to.have.been.calledWith(mockAnswer);
      expect(nextMock).to.have.callCount(4);
    });

    it('should reauth an existing user', async () => {
      const postController = sandbox.stub();
      const getAllController = sandbox.stub();
      const refreshController = sandbox.stub();
      const mockUser = { email: 'text@example.com' };
      const mockAnswer = [Object.assign({}, mockUser, { auth: { id: '111', role: 'basic' } })];
      const sendReturningAuthEmail = sandbox.stub().resolves();
      const mockReq = {
        body: Object.assign(mockUser, { eventSlug: 'cp-2018' }),
        app: {
          locals: {
            logger: {
              error: loggerStub,
            },
            mailing: {
              sendReturningAuthEmail,
            },
          },
        },
      };
      const mockRes = {
        status: statusStub,
        locals: {
          user: mockUser,
        },
      };
      userController.post = postController;
      userController.getAll = getAllController.resolves(mockAnswer);
      authController.refresh = refreshController.resolves({ id: '111', token: 'new' });
      await handler(mockReq, mockRes, nextMock);
      expect(getAllController).to.have.been.calledOnce;
      expect(getAllController).to.have.been.calledWith(
        { email: mockReq.body.email },
        ['auth'],
      );
      expect(postController).to.not.have.been.called;
      expect(refreshController).to.have.been.calledOnce;
      expect(refreshController).to.have.been.calledWith('111');
      expect(sendReturningAuthEmail).to.have.been.calledOnce;
      expect(sendReturningAuthEmail).to.have.been.calledWith(mockUser.email, event, 'new');
      expect(loggerStub).to.have.been.calledOnce;
      expect(loggerStub.getCall(0).args[0].message).to.equal('Error while saving a user.');
      expect(loggerStub.getCall(0).args[0].status).to.equal(409);
      expect(jsonStub).to.not.have.been.called;
      expect(nextMock).to.have.callCount(5);
    });

    it('should disallow login for admins', async () => {
      const postController = sandbox.stub();
      const getAllController = sandbox.stub();
      const mockUser = { email: 'hello@coolestprojects.org', auth: { role: 'admin' } };
      const mockAnswer = [Object.assign({}, mockUser)];
      const sendReturningAuthEmail = sandbox.stub().resolves();
      const mockReq = {
        body: Object.assign(mockUser, { eventSlug: 'cp-2018' }),
        app: {
          locals: {
            logger: {
              error: loggerStub,
            },
            mailing: {
              sendReturningAuthEmail,
            },
          },
        },
      };
      const mockRes = {
        status: statusStub,
        locals: {},
      };
      userController.post = postController;
      userController.getAll = getAllController.resolves(mockAnswer);
      await handler(mockReq, mockRes, nextMock);
      expect(getAllController).to.have.been.calledOnce;
      expect(getAllController).to.have.been.calledWith(
        { email: mockReq.body.email },
        ['auth'],
      );
      expect(postController).to.not.have.been.called;
      expect(loggerStub).to.have.been.calledOnce;
      expect(loggerStub.getCall(0).args[0].message).to.equal('Error while saving a user.');
      expect(loggerStub.getCall(0).args[0].status).to.equal(401);
      expect(jsonStub).to.not.have.been.called;
      expect(nextMock).to.have.callCount(5);
    });

    it('should log generic error triggered by the controller', async () => {
      const postController = sandbox.stub();
      const getAllController = sandbox.stub();
      const mockUser = { email: 'text@example.com' };
      const mockReq = {
        body: mockUser,
        app: {
          locals: {
            logger: {
              error: loggerStub,
            },
          },
        },
      };
      const mockRes = {
        status: statusStub,
        locals: {},
      };
      const mockErr = new Error('Fake err');

      userController.getAll = getAllController.resolves([]);
      userController.post = postController.rejects(mockErr);
      await handler(mockReq, mockRes, nextMock);
      expect(postController).to.have.been.calledWith({ email: mockReq.body.email });
      expect(loggerStub).to.have.been.calledOnce;
      expect(loggerStub.getCall(0).args[0].message).to.be.equal('Fake err');
      expect(nextMock).to.have.callCount(5);
      expect(nextMock.getCall(4).args[0].message).to.have.equal('Error while saving a user.');
    });

    it('should create a new user if a user with the email exists, but without an auth', async () => {
      const postController = sandbox.stub();
      const getAllController = sandbox.stub();
      const mockUser = { email: 'text@example.com' };
      const mockAnswer = { user: mockUser, auth: {} };
      const mockReq = {
        body: mockUser,
      };
      const mockRes = {
        status: statusStub,
        locals: {},
      };
      userController.getAll = getAllController.resolves([mockAnswer]);
      userController.post = postController.resolves(mockAnswer);
      await handler(mockReq, mockRes, nextMock);
      expect(postController).to.have.been.calledOnce;
      expect(postController).to.have.been.calledWith({ email: mockReq.body.email });

      expect(statusStub).to.have.been.calledOnce;
      expect(statusStub).to.have.been.calledWith(200);
      expect(jsonStub).to.have.been.calledOnce;
      expect(jsonStub).to.have.been.calledWith(mockAnswer);
      expect(nextMock).to.have.callCount(4);
    });
  });
  describe('get', () => {
    let sandbox;
    let handler;
    const userController = class {};
    const authController = class {};
    let statusStub;
    let jsonStub;
    let errorHandler;
    before(() => {
      sandbox = sinon.createSandbox();
      handlers = (proxy('../../../routes/handlers/users', {
        '../../controllers/users': userController,
        '../../controllers/auth': authController,
      })).getAll;
      jsonStub = sandbox.stub();
      errorHandler = sandbox.stub();
      handler = (req, res, next) => {
        return handlers[0](req, res)
          .catch(err => errorHandler(err));
      };
    });

    beforeEach(() => {
      sandbox.reset();
      statusStub = sandbox.stub().returns({
        json: jsonStub,
      });
    });

    it('should format to json', async () => {
      const getAllController = sandbox.stub();
      const query = {
        gender: 'female',
      };
      const mockReq = {
        query,
      };
      const mockRes = {
        status: statusStub,
      };

      userController.getExtended = getAllController.resolves({
        models: [],
        pagination: { rowCount: 0 },
      });
      await handler(mockReq, mockRes);
      expect(userController.getExtended).to.have.been.calledWith(query);
      expect(statusStub).to.have.been.calledWith(200);
      expect(jsonStub).to.have.been.calledWith({
        count: 0,
        data: [],
      });
    });
  });
  describe('postAdmin', () => {
    let sandbox;
    let handler;
    const userController = class {};
    const authController = class {};
    const eventController = class {};
    let statusStub;
    let nextMock;
    let errorHandler;
    before(() => {
      sandbox = sinon.createSandbox();
      handlers = (proxy('../../../routes/handlers/users', {
        '../../controllers/users': userController,
        '../../controllers/auth': authController,
        '../../controllers/events': eventController,
      })).postAdmin;
      errorHandler = sandbox.stub();
      handler = (req, res, next) => {
        return handlers[0](req, res, next)
          .then(() => handlers[1](req, res, next))
          .catch(err => errorHandler(err));
      };
    });

    beforeEach(() => {
      sandbox.reset();
      statusStub = sandbox.stub();
      nextMock = sandbox.stub().callsFake((err, data) => {
        if (err) return Promise.reject(err);
        return Promise.resolve(data);
      });
    });

    it('should create the user and send an email', async () => {
      const postController = sandbox.stub();
      const mockUser = { email: 'text@example.com', password: 'bla' };
      const mockAnswer = { user: mockUser, auth: {} };
      const mockMailing = {
        sendNewAdminEmail: sandbox.stub().resolves(),
      };
      const mockReq = {
        body: mockUser,
        app: {
          locals: {
            mailing: mockMailing,
          },
        },
      };
      const mockRes = {
        sendStatus: statusStub,
        locals: {},
      };
      userController.post = postController.resolves(mockAnswer);
      await handler(mockReq, mockRes, nextMock);
      expect(postController).to.have.been.calledOnce;
      expect(postController).to.have.been.calledWith({ email: mockReq.body.email }, { role: 'admin', password: mockReq.body.password });
      expect(mockMailing.sendNewAdminEmail).to.have.been.calledWith(
        mockReq.body.email,
        mockReq.body.password,
      );
      expect(statusStub).to.have.been.calledOnce;
      expect(statusStub).to.have.been.calledWith(200);
      expect(nextMock).to.have.callCount(1);
    });
    it('should return 500 on error', async () => {
      const postController = sandbox.stub();
      const mockUser = { email: 'text@example.com', password: 'bla' };
      const mockMailing = {
        sendNewAdminEmail: sandbox.stub().resolves(),
      };
      const mockReq = {
        body: mockUser,
        app: {
          locals: {
            mailing: mockMailing,
          },
        },
      };
      const mockRes = {
        sendStatus: statusStub.resolves(),
        locals: {},
      };
      userController.post = postController.rejects();
      await handler(mockReq, mockRes, nextMock);
      expect(postController).to.have.been.calledOnce;
      expect(postController).to.have.been.calledWith({
        email: mockReq.body.email,
      }, {
        role: 'admin',
        password: mockReq.body.password,
      });
      expect(nextMock).to.have.callCount(0);
      expect(mockMailing.sendNewAdminEmail).to.not.have.been.called;
    });
  });
});
