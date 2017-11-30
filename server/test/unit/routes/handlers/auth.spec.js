const proxy = require('proxyquire');

describe('auth handlers', () => {
  const sandbox = sinon.sandbox.create();
  describe('authenticate', () => {
    beforeEach(() => {
      sandbox.reset();
    });
    it('should return the auth the token exists', (done) => {
      // DATA
      const jwt = { data: 'xxxx' };
      const authMock = { user_id: 'xxxx', token: 'aaa' };
      // STUBS
      const authModel = {};
      const handlers = proxy('../../../../routes/handlers/auth.js', {
        '../../models/auth': authModel,
      });
      const handlerGetStub = sinon.stub(handlers, 'get');
      handlerGetStub.resolves(authMock);
      // ACT
      handlers.authenticate(jwt, (err, auth) => {
        // Load the token by userId
        expect(handlerGetStub).to.have.been.calledOnce;
        expect(handlerGetStub).to.have.been.calledWith(jwt.data);
        // Return a truthy value if found
        expect(auth).to.be.eql(authMock);
        expect(err).to.be.null;
        done();
      });
    });
    it('should return false if the token doesn\'t exists', (done) => {
      // DATA
      const jwt = { data: 'xxxx' };
      const authMock = null;
      // STUBS
      const authModel = {};
      const handlers = proxy('../../../../routes/handlers/auth.js', {
        '../../models/auth': authModel,
      });
      const handlerGetStub = sinon.stub(handlers, 'get');
      handlerGetStub.resolves(authMock);
      // ACT
      handlers.authenticate(jwt, (err, auth) => {
        // Load the token by userId
        expect(handlerGetStub).to.have.been.calledOnce;
        expect(handlerGetStub).to.have.been.calledWith(jwt.data);
        // Return a truthy value if found
        expect(auth).to.be.eql(false);
        expect(err).to.be.null;
        done();
      });
    });
    it('should return false on error', (done) => {
      // DATA
      const jwt = { data: 'xxxx' };
      const authMock = new Error('Cant reach DB');
      // STUBS
      const authModel = {};
      const handlers = proxy('../../../../routes/handlers/auth.js', {
        '../../models/auth': authModel,
      });
      const handlerGetStub = sinon.stub(handlers, 'get');
      handlerGetStub.resolves(authMock);
      // ACT
      handlers.authenticate(jwt, (err, auth) => {
        // Load the token by userId
        expect(handlerGetStub).to.have.been.calledOnce;
        expect(handlerGetStub).to.have.been.calledWith(jwt.data);
        // Return a truthy value if found
        expect(err).to.be.null;
        expect(auth).to.be.false;
        done();
      });
    });
  });
});
