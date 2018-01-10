const proxy = require('proxyquire').noCallThru();

describe('router: events', () => {
  let handlers;
  describe('get', () => {
    let sandbox;
    let handler;
    const eventController = class {};
    let loggerStub;
    let statusStub;
    let jsonStub;
    let nextMock;
    let errorHandler;
    before(() => {
      sandbox = sinon.sandbox.create();
      handlers = (proxy('../../../routes/handlers/events', {
        '../../controllers/events': eventController,
      })).get;
      loggerStub = sandbox.stub();
      jsonStub = sandbox.stub();
      errorHandler = sandbox.stub();
      handler = (req, res, next) => {
        return handlers[0](req, res, next)
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
});
