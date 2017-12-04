const proxy = require('proxyquire');
const jsonwebtoken = require('jsonwebtoken');
const config = require('../../../../config/auth');

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

  describe('verify', () => {
    beforeEach(() => {
      sandbox.reset();
    });
    it('should return true if the token is valid', async () => {
      // DATA
      const jwt = { data: 'xxxx' };
      const token = jsonwebtoken.sign(jwt, config.authSecret);
      // STUBS
      const fetchStub = sinon.stub().resolves(token);
      const whereStub = sinon.stub().returns({
        fetch: fetchStub,
      });
      const verifyTokenStub = sinon.stub().returns(jwt);
      const authModel = sinon.stub().returns({
        where: whereStub,
        verifyToken: verifyTokenStub,
      });
      const handlers = proxy('../../../../routes/handlers/auth.js', {
        '../../models/auth': authModel,
      });
      // ACT
      const res = await handlers.verify(token);

      // Load the token by userId
      expect(whereStub).to.have.been.calledWith({ token });
      expect(authModel).to.have.been.calledTwice;
      expect(verifyTokenStub).to.have.been.calledOnce;
      expect(verifyTokenStub).to.have.been.calledWith(token);
      // Return a truthy value if found
      expect(res).to.be.true;
    });
    it('should throw if the token is outdated', (done) => {
      const jwt = { data: 'xxxx' };
      const token = jsonwebtoken.sign(jwt, config.authSecret, { expiresIn: '1s' });
      // STUBS
      const fetchStub = sinon.stub().resolves(token);
      const whereStub = sinon.stub().returns({
        fetch: fetchStub,
      });

      const verifyTokenStub = sinon.stub().throws(new Error('jwt expired'));
      const authModel = sinon.stub().returns({
        where: whereStub,
        verifyToken: verifyTokenStub,
      });
      const handlers = proxy('../../../../routes/handlers/auth.js', {
        '../../models/auth': authModel,
      });
      // ACT
      setTimeout(async () => {
        try {
          await handlers.verify(token);
        } catch (e) {
          // Load the token by userId
          expect(authModel).to.have.been.calledTwice;
          expect(whereStub).to.have.been.calledWith({ token });
          expect(verifyTokenStub).to.have.been.calledOnce;
          expect(verifyTokenStub).to.have.been.calledWith(token);
          expect(e.message).to.equal('jwt expired');
          done();
        }
      }, 1000);
    });
    it('should thow if the token doesnt exists', async () => {
      const token = 'aaaaa';
      // STUBS
      const fetchStub = sinon.stub().resolves(undefined);
      const whereStub = sinon.stub().returns({
        fetch: fetchStub,
      });
      const authModel = sinon.stub().returns({
        where: whereStub,
      });
      const handlers = proxy('../../../../routes/handlers/auth.js', {
        '../../models/auth': authModel,
      });
      // ACT

      try {
        await handlers.verify(token);
      } catch (e) {
        // Load the token by userId
        expect(authModel).to.have.been.calledOnce;
        expect(whereStub).to.have.been.calledWith({ token });
        expect(e.message).to.equal('Invalid token');
      }
    });
  });
});
