const proxy = require('proxyquire').noCallThru();
const jsonwebtoken = require('jsonwebtoken');
const config = require('../../../config/auth');

describe('auth controllers', () => {
  const sandbox = sinon.sandbox.create();
  describe('authenticate', () => {
    beforeEach(() => {
      sandbox.reset();
    });
    it('should return the auth the token exists', (done) => {
      // DATA
      const jwt = { data: 'xxxx' };
      const authInstance = { user_id: 'xxxx', token: 'aaa' };
      const authMock = Object.assign({}, authInstance, { toJSON: () => authInstance });
      // STUBS
      const authModel = {};
      const controllers = proxy('../../../controllers/auth.js', {
        '../models/auth': authModel,
      });
      const handlerGetStub = sinon.stub(controllers, 'get');
      handlerGetStub.resolves(authMock);
      // ACT
      controllers.authenticate(jwt, (err, auth) => {
        // Load the token by userId
        expect(handlerGetStub).to.have.been.calledOnce;
        expect(handlerGetStub).to.have.been.calledWith(jwt.data);
        // Return a truthy value if found
        expect(auth).to.be.eql(authInstance);
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
      const controllers = proxy('../../../controllers/auth.js', {
        '../models/auth': authModel,
      });
      const handlerGetStub = sinon.stub(controllers, 'get');
      handlerGetStub.resolves(authMock);
      // ACT
      controllers.authenticate(jwt, (err, auth) => {
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
      const controllers = proxy('../../../controllers/auth.js', {
        '../models/auth': authModel,
      });
      const handlerGetStub = sinon.stub(controllers, 'get');
      handlerGetStub.resolves(authMock);
      // ACT
      controllers.authenticate(jwt, (err, auth) => {
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
      const authModel = class {
        static where() {}
      };
      const fetchStub = sinon.stub().resolves(token);
      const whereStub = sinon.stub(authModel, 'where').returns({
        fetch: fetchStub,
      });
      authModel.verifyToken = sinon.stub().returns(jwt);

      const controllers = proxy('../../../controllers/auth.js', {
        '../models/auth': authModel,
      });
      // ACT
      const res = await controllers.verify(token, 'basic');

      // Load the token by userId
      expect(whereStub).to.have.been.calledWith({ token, role: 'basic' });
      expect(authModel.verifyToken).to.have.been.calledOnce;
      expect(authModel.verifyToken).to.have.been.calledWith(token);
      // Return a truthy value if found
      expect(res).to.be.true;
    });


    it('should throw if the token is outdated', (done) => {
      const jwt = { data: 'xxxx' };
      const token = jsonwebtoken.sign(jwt, config.authSecret, { expiresIn: '1s' });
      // STUBS
      const authModel = class {
        static where() {}
      };
      const fetchStub = sinon.stub().resolves(token);
      const whereStub = sinon.stub(authModel, 'where').returns({
        fetch: fetchStub,
      });
      authModel.verifyToken = sinon.stub().throws(new Error('jwt expired'));
      const controllers = proxy('../../../controllers/auth.js', {
        '../models/auth': authModel,
      });
      // ACT
      setTimeout(async () => {
        try {
          await controllers.verify(token, 'basic');
        } catch (e) {
          // Load the token by userId
          expect(whereStub).to.have.been.calledWith({ token, role: 'basic' });
          expect(authModel.verifyToken).to.have.been.calledOnce;
          expect(authModel.verifyToken).to.have.been.calledWith(token);
          expect(e.message).to.equal('jwt expired');
          done();
        }
      }, 1000);
    });
    it('should thow if the token doesnt exists', async () => {
      const token = 'aaaaa';
      // STUBS
      const authModel = class {
        static where() {}
      };
      const fetchStub = sinon.stub().resolves(undefined);
      const whereStub = sinon.stub(authModel, 'where').returns({
        fetch: fetchStub,
      });

      const controllers = proxy('../../../controllers/auth.js', {
        '../models/auth': authModel,
      });
      // ACT

      try {
        await controllers.verify(token, 'basic');
      } catch (e) {
        // Load the token by userId
        expect(whereStub).to.have.been.calledWith({ token, role: 'basic' });
        expect(e.message).to.equal('Invalid token');
      }
    });
  });

  describe('refresh', () => {
    it('should save the existing token ', async () => {
      const id = '111';
      const where = sinon.stub();
      const authModel = {
        where,
      };
      const controller = proxy('../../../controllers/auth.js', {
        '../models/auth': authModel,
      });
      const save = sinon.stub();
      const parse = sinon.stub();
      const attributes = {
        id,
        token: 'aaa',
      };
      const auth = {
        save,
      };
      save.resolves({ parse, attributes });
      parse.resolves(attributes);
      const fetch = sinon.stub().resolves(auth);
      where.returns({ fetch });

      await controller.refresh(id);
      expect(authModel.where).to.have.been.calledOnce;
      expect(authModel.where).to.have.been.calledWith({ id });
      expect(fetch).to.have.been.calledOnce;
      expect(save).to.have.been.calledOnce;
      // Bug Workaround
      expect(parse).to.have.been.calledOnce;
      expect(parse).to.have.been.calledWith(attributes);
    });
  });
});
