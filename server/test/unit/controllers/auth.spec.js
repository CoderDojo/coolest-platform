const proxy = require('proxyquire').noCallThru();
const jsonwebtoken = require('jsonwebtoken');
const config = require('../../../config/auth');

describe('auth controllers', () => {
  const sandbox = sinon.createSandbox();
  const userModel = {};
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
        '../models/user': userModel,
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
        '../models/user': userModel,
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
        '../models/user': userModel,
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
        '../models/user': userModel,
      });
      // ACT
      const res = await controllers.verify(token, 'basic');

      // Load the token by userId
      expect(whereStub).to.have.been.calledWith({ token, role: 'basic' });
      expect(authModel.verifyToken).to.have.been.calledOnce;
      expect(authModel.verifyToken).to.have.been.calledWith(token);
      // Return a truthy value if found
      expect(Object.keys(res)).to.eql(['userId']);
      expect(res.userId).to.be.equal('xxxx');
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
        '../models/user': userModel,
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
        '../models/user': userModel,
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
        '../models/user': userModel,
      });
      const save = sinon.stub();
      const toJSON = sinon.stub();
      const attributes = {
        id,
        token: 'aaa',
      };
      const auth = {
        save,
      };
      save.resolves({ toJSON, attributes });
      toJSON.returns(attributes);
      const fetch = sinon.stub().resolves(auth);
      where.returns({ fetch });

      await controller.refresh(id);
      expect(authModel.where).to.have.been.calledOnce;
      expect(authModel.where).to.have.been.calledWith({ id });
      expect(fetch).to.have.been.calledOnce;
      expect(save).to.have.been.calledOnce;
      // Bug Workaround
      expect(toJSON).to.have.been.calledOnce;
    });
  });
  describe('adminLogin', () => {
    it('should return the auth', (done) => {
      const email = 'hello@coolestprojects.org';
      const password = 'banana';
      const controller = proxy('../../../controllers/auth.js', {
        '../models/auth': {},
        '../models/user': userModel,
      });
      const verifyPassword = sinon.stub().resolves(true);
      const save = sinon.stub();
      const toJSON = sinon.stub();
      const auth = {
        id: 2,
        token: 'aa',
        user_id: 1,
        password: 'xxx',
      };
      const user = {
        id: 1,
        relations: {
          auth: Object.assign({}, auth, { verifyPassword }, { save }),
        },
      };
      const fetch = sinon.stub().resolves(user);
      save.resolves({ attributes: auth, toJSON });
      toJSON.resolves(auth);
      userModel.where = sinon.stub().returns({ fetch });

      controller.adminLogin(email, password, (err, _auth) => {
        expect(userModel.where).to.have.been.calledOnce;
        expect(userModel.where).to.have.been.calledWith({ email });
        expect(fetch).to.have.been.calledOnce;
        expect(fetch).to.have.been.calledWith({ withRelated: [{ auth: sinon.match.func }] });
        expect(verifyPassword).to.have.been.calledOnce;
        expect(verifyPassword).to.have.been.calledWith(password);

        expect(save).to.have.been.calledOnce;
        expect(toJSON).to.have.been.calledOnce;

        expect(_auth).to.eql(auth);
        done();
      });
    });
    it('should return false on wrong password', (done) => {
      const email = 'hello@coolestprojects.org';
      const password = 'banana';
      const controller = proxy('../../../controllers/auth.js', {
        '../models/auth': {},
        '../models/user': userModel,
      });
      const verifyPassword = sinon.stub().resolves(false);
      const save = sinon.stub();
      const parse = sinon.stub();
      const auth = {
        id: 2,
        token: 'aa',
        user_id: 1,
        password: 'xxx',
      };
      const user = {
        id: 1,
        relations: { auth: Object.assign({}, auth, { verifyPassword }, { save }) },
      };
      const fetch = sinon.stub().resolves(user);
      save.resolves({ attributes: auth, parse });
      parse.resolves(auth);
      userModel.where = sinon.stub().returns({ fetch });

      controller.adminLogin(email, password, (err, _auth) => {
        expect(userModel.where).to.have.been.calledOnce;
        expect(userModel.where).to.have.been.calledWith({ email });
        expect(fetch).to.have.been.calledOnce;
        expect(fetch).to.have.been.calledWith({ withRelated: [{ auth: sinon.match.func }] });
        expect(verifyPassword).to.have.been.calledOnce;
        expect(verifyPassword).to.have.been.calledWith(password);

        expect(save).to.have.not.been.called;
        expect(parse).to.have.not.been.called;

        expect(_auth).to.be.false;
        done();
      });
    });
    it('should return false on error', (done) => {
      const email = 'hello@coolestprojects.org';
      const password = 'banana';
      const controller = proxy('../../../controllers/auth.js', {
        '../models/auth': {},
        '../models/user': userModel,
      });
      const fetch = sinon.stub().rejects();
      userModel.where = sinon.stub().returns({ fetch });

      controller.adminLogin(email, password, (err, _auth) => {
        expect(userModel.where).to.have.been.calledOnce;
        expect(userModel.where).to.have.been.calledWith({ email });
        expect(fetch).to.have.been.calledOnce;
        expect(fetch).to.have.been.calledWith({ withRelated: [{ auth: sinon.match.func }] });

        expect(_auth).to.be.false;
        done();
      });
    });
    it('should return false when the user is not found', (done) => {
      const email = 'hello@coolestprojects.org';
      const password = 'banana';
      const controller = proxy('../../../controllers/auth.js', {
        '../models/auth': {},
        '../models/user': userModel,
      });
      const fetch = sinon.stub().resolves({});
      userModel.where = sinon.stub().returns({ fetch });

      controller.adminLogin(email, password, (err, _auth) => {
        expect(userModel.where).to.have.been.calledOnce;
        expect(userModel.where).to.have.been.calledWith({ email });
        expect(fetch).to.have.been.calledOnce;
        expect(fetch).to.have.been.calledWith({ withRelated: [{ auth: sinon.match.func }] });

        expect(_auth).to.be.false;
        done();
      });
    });
    it('should return false when the auth is not found', (done) => {
      const email = 'hello@coolestprojects.org';
      const password = 'banana';
      const controller = proxy('../../../controllers/auth.js', {
        '../models/auth': {},
        '../models/user': userModel,
      });
      const verifyPassword = sinon.stub();
      const fetch = sinon.stub().resolves({ id: 1, relations: { auth: { verifyPassword } } });
      userModel.where = sinon.stub().returns({ fetch });

      controller.adminLogin(email, password, (err, _auth) => {
        expect(userModel.where).to.have.been.calledOnce;
        expect(userModel.where).to.have.been.calledWith({ email });
        expect(fetch).to.have.been.calledOnce;
        expect(fetch).to.have.been.calledWith({ withRelated: [{ auth: sinon.match.func }] });
        expect(verifyPassword).to.not.have.been.called;
        expect(_auth).to.be.false;
        done();
      });
    });
  });
});
