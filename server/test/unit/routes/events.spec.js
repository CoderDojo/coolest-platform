const proxy = require('proxyquire').noCallThru();

describe('router: events', () => {
  let sandbox;
  let handlers;
  const eventController = class {};
  const projectController = class {};
  let loggerStub;
  let statusStub;
  let jsonStub;
  let sendStub;
  let errorHandler;
  let nextMock;

  before(() => {
    sandbox = sinon.sandbox.create();
    handlers = proxy('../../../routes/handlers/events', {
      '../../controllers/events': eventController,
      '../../controllers/projects': projectController,
    });
    loggerStub = sandbox.stub();
    jsonStub = sandbox.stub();
    sendStub = sandbox.stub();
    errorHandler = sandbox.stub();
    statusStub = sandbox.stub();
    nextMock = sandbox.stub();
  });

  beforeEach(() => {
    sandbox.reset();
    statusStub.returns({
      json: jsonStub,
      send: sendStub,
    });
    nextMock.callsFake((err, data) => {
      if (err) return Promise.reject(err);
      return Promise.resolve(data);
    });
  });

  describe('get', () => {
    let handler;
    before(() => {
      handler = (req, res, next) => {
        return handlers.get[0](req, res, next)
          .catch(err => errorHandler(err));
      };
    });

    it('should format to json', async () => {
      const getController = sandbox.stub();
      const slug = 'cp-2018';
      const mockAnswer = { event: { slug, name: slug } };
      const mockReq = {
        params: { slug },
      };
      const mockRes = {
        status: statusStub,
        locals: {},
      };
      eventController.get = getController.resolves(mockAnswer);
      await handler(mockReq, mockRes, nextMock);
      expect(getController).to.have.been.calledOnce;
      expect(getController).to.have.been.calledWith({ slug });

      expect(statusStub).to.have.been.calledOnce;
      expect(statusStub).to.have.been.calledWith(200);
      expect(jsonStub).to.have.been.calledOnce;
      expect(jsonStub).to.have.been.calledWith(mockAnswer);
      expect(nextMock).to.not.have.been.called;
    });

    it('should return an error', async () => {
      const getController = sandbox.stub();
      const slug = 'cp-2018';
      const fakeErr = new Error('Fake err');
      const mockReq = {
        params: { slug },
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
      eventController.get = getController.rejects(fakeErr);
      await handler(mockReq, mockRes, nextMock);
      expect(getController).to.have.been.calledOnce;
      expect(getController).to.have.been.calledWith({ slug });
      expect(loggerStub).to.have.been.calledOnce;
      expect(loggerStub.getCall(0).args[0].message).to.be.equal('Fake err');
      expect(nextMock).to.have.been.calledOnce;
      expect(nextMock.getCall(0).args[0].message).to.have.equal('Error while searching for an event.');
    });
  });

  describe('sendConfirmAttendanceEmail', () => {
    let handler;
    before(() => {
      handler = (req, res, next) => {
        return handlers.sendConfirmAttendanceEmail[0](req, res, next)
          .catch(err => errorHandler(err));
      };
    });

    it('should return 204 when successful', async () => {
      // ARRANGE
      const getEventController = sandbox.stub().resolves({
        id: 'foo',
        attributes: { slug: 'bar' },
        formattedDate: () => 'Some date',
      });
      const getExtendedProjectController = sandbox.stub().resolves({
        toJSON: () => 'some jsons',
      });
      eventController.get = getEventController;
      projectController.getExtended = getExtendedProjectController;
      const eventId = 'foo';
      const sendEmailStub = sandbox.stub().resolves();
      const reqMock = {
        params: { eventId },
        app: {
          locals: {
            mailing: {
              sendConfirmAttendanceEmail: sendEmailStub,
            },
          },
        },
      };
      const resMock = { status: statusStub };

      // ACT
      await handler(reqMock, resMock, nextMock);

      // ASSERT
      expect(sendEmailStub).to.have.been.calledOnce;
      expect(sendEmailStub).to.have.been.calledWith('some jsons', { slug: 'bar', date: 'Some date' });
      expect(statusStub).to.have.been.calledOnce;
      expect(statusStub).to.have.been.calledWith(204);
      expect(sendStub).to.have.been.calledOnce;
    });

    it('should call next with an error if eventController fails', async () => {
      // ARRANGE
      const getEventController = sandbox.stub().rejects(new Error('Fake err'));
      const getExtendedProjectController = sandbox.stub();
      eventController.get = getEventController;
      const eventId = 'foo';
      const sendEmailStub = sandbox.stub();
      const reqMock = {
        params: { eventId },
        app: {
          locals: {
            logger: {
              error: loggerStub,
            },
            mailing: {
              sendConfirmAttendanceEmail: sendEmailStub,
            },
          },
        },
      };
      const resMock = { status: statusStub };

      // ACT
      await handler(reqMock, resMock, nextMock);

      // ASSERT
      expect(getEventController).to.have.been.calledOnce;
      expect(getExtendedProjectController).to.not.have.been.called;
      expect(sendEmailStub).to.not.have.been.called;
      expect(loggerStub).to.have.been.calledOnce;
      expect(loggerStub.getCall(0).args[0].message).to.be.equal('Fake err');
      expect(nextMock).to.have.been.calledOnce;
      expect(nextMock.getCall(0).args[0].message).to.have.equal('Error while sending confirm attendance emails');
    });

    it('should call next with an error if projectController fails', async () => {
      // ARRANGE
      const getEventController = sandbox.stub().resolves({
        id: 'foo',
        attributes: { slug: 'bar' },
        formattedDate: () => 'Some date',
      });
      const getExtendedProjectController = sandbox.stub().rejects(new Error('Fake err'));
      eventController.get = getEventController;
      projectController.getExtended = getExtendedProjectController;
      const eventId = 'foo';
      const sendEmailStub = sandbox.stub();
      const reqMock = {
        params: { eventId },
        app: {
          locals: {
            logger: {
              error: loggerStub,
            },
            mailing: {
              sendConfirmAttendanceEmail: sendEmailStub,
            },
          },
        },
      };
      const resMock = { status: statusStub };

      // ACT
      await handler(reqMock, resMock, nextMock);

      // ASSERT
      expect(getEventController).to.have.been.calledOnce;
      expect(getExtendedProjectController).to.have.been.calledOnce;
      expect(sendEmailStub).to.not.have.been.called;
      expect(loggerStub).to.have.been.calledOnce;
      expect(loggerStub.getCall(0).args[0].message).to.be.equal('Fake err');
      expect(nextMock).to.have.been.calledOnce;
      expect(nextMock.getCall(0).args[0].message).to.have.equal('Error while sending confirm attendance emails');
    });

    it('should call next with an error if mailer fails', async () => {
      // ARRANGE
      const getEventController = sandbox.stub().resolves({
        id: 'foo',
        attributes: { slug: 'bar' },
        formattedDate: () => 'Some date',
      });
      const getExtendedProjectController = sandbox.stub().resolves({
        toJSON: () => 'some jsons',
      });
      eventController.get = getEventController;
      projectController.getExtended = getExtendedProjectController;
      const eventId = 'foo';
      const sendEmailStub = sandbox.stub().rejects(new Error('Fake err'));
      const reqMock = {
        params: { eventId },
        app: {
          locals: {
            logger: {
              error: loggerStub,
            },
            mailing: {
              sendConfirmAttendanceEmail: sendEmailStub,
            },
          },
        },
      };
      const resMock = { status: statusStub };

      // ACT
      await handler(reqMock, resMock, nextMock);

      // ASSERT
      expect(getEventController).to.have.been.calledOnce;
      expect(getExtendedProjectController).to.have.been.calledOnce;
      expect(sendEmailStub).to.have.been.calledOnce;
      expect(loggerStub).to.have.been.calledOnce;
      expect(loggerStub.getCall(0).args[0].message).to.be.equal('Fake err');
      expect(nextMock).to.have.been.calledOnce;
      expect(nextMock.getCall(0).args[0].message).to.have.equal('Error while sending confirm attendance emails');
    });
  });
});
