const proxy = require('proxyquire').noCallThru();

describe('users controllers', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.reset();
  });

  describe('post', () => {
    it('should create a basic User by default', async () => {
      const email = 'test@test.com';
      const mockUserSave = sandbox.stub().resolves({ id: 1, email });
      const mockAuthSave = sandbox.stub().resolves({ id: 'auth', user_id: 1, token: 'imbatman' });
      const mockUserModel = sandbox.stub().returns({
        save: mockUserSave,
      });
      const mockAuthModel = sandbox.stub().returns({
        save: mockAuthSave,
      });
      const controllers = proxy('../../../controllers/users', {
        '../models/user': mockUserModel,
        '../models/auth': mockAuthModel,
      });
      const res = await controllers.post({ email });

      expect(mockUserModel).to.have.been.calledOnce;
      expect(mockUserModel).to.have.been.calledWith({ email });
      expect(mockAuthModel).to.have.been.calledWith({ role: 'basic', userId: 1 });
      expect(mockUserSave).to.have.been.calledOnce;
      expect(mockAuthSave).to.have.been.calledOnce;
      expect(res).to.eql({ user: { id: 1, email }, auth: { id: 'auth', user_id: 1, token: 'imbatman' } });
    });

    it('should create a admin User with a password', async () => {
      const email = 'test@test.com';
      const mockAuthSetPassword = sandbox.stub().resolves();
      const mockUserSave = sandbox.stub().resolves({ id: 1, email });
      const mockAuthSave = sandbox.stub();
      const mockUserModel = sandbox.stub().returns({
        save: mockUserSave,
      });
      const mockAuthModel = sandbox.stub().returns({
        save: mockAuthSave,
      });
      mockAuthSave.resolves({
        id: 'auth',
        user_id: 1,
        token: 'imbatman',
        setPassword: mockAuthSetPassword,
        save: mockAuthSave,
      });
      const controllers = proxy('../../../controllers/users', {
        '../models/user': mockUserModel,
        '../models/auth': mockAuthModel,
      });
      const res = await controllers.post({ email }, { role: 'admin', password: 'bla' });

      expect(mockUserModel).to.have.been.calledOnce;
      expect(mockUserModel).to.have.been.calledWith({ email });
      expect(mockAuthModel).to.have.been.calledWith({ role: 'admin', userId: 1 });
      expect(mockAuthSetPassword).to.have.been.calledWith('bla');
      expect(mockUserSave).to.have.been.calledOnce;
      expect(mockAuthSave).to.have.been.calledTwice;
      expect(res).to.eql({
        user: {
          id: 1,
          email,
        },
        auth: {
          id: 'auth',
          user_id: 1,
          token: 'imbatman',
          save: mockAuthSave,
          setPassword: mockAuthSetPassword,
        },
      });
    });

    it('should return 409 if the User already exists', async () => {
      class UniqueViolationError extends Error {
        constructor(message) {
          super(message);
          this.code = '23505';
        }
      }
      const err = new UniqueViolationError('unique_violation');
      const mockUserSave = sandbox.stub().returns(Promise.reject(err));
      const mockUserModel = sandbox.stub().returns({
        save: mockUserSave,
      });
      const controllers = proxy('../../../controllers/users', {
        '../models/user': mockUserModel,
        '../models/auth': {},
      });
      const email = 'test@test.com';
      try {
        await controllers.post({ email });
      } catch (_err) {
        expect(mockUserModel).to.have.been.calledOnce;
        expect(mockUserModel).to.have.been.calledWith({ email });
        expect(mockUserSave).to.have.been.calledOnce;
        expect(_err.message).to.equal('User already exists');
        expect(_err.status).to.equal(409);
      }
    });

    it('should return an error on erroneous behavior when it\'s not a 409', (done) => {
      const err = new Error('Fake err');
      const mockUserSave = sandbox.stub().rejects(err);
      const mockUserModel = sandbox.stub().returns({
        save: mockUserSave,
      });
      const controllers = proxy('../../../controllers/users', {
        '../models/user': mockUserModel,
        '../models/auth': {},
      });
      const email = 'test@test.com';
      controllers.post({ email })
        .catch((_err) => {
          expect(mockUserModel).to.have.been.calledOnce;
          expect(mockUserModel).to.have.been.calledWith({ email });
          expect(mockUserSave).to.have.been.calledOnce;
          expect(_err.message).to.equal(err.message);
          done();
        });
    });
  });

  describe('get', () => {
    it('should return the matching user as JSON', async () => {
      const user = {
        toJSON: sandbox.stub().returns({
          id: 'foo',
        }),
      };
      const mockUserFetch = sandbox.stub().resolves(user);
      const mockUserForge = sandbox.stub().returns({ fetch: mockUserFetch });
      const mockUserModel = { forge: mockUserForge };
      const identifier = { email: 'foo@example.com' };
      const withRelated = ['auth'];
      const controller = proxy('../../../controllers/users', {
        '../models/user': mockUserModel,
        '../models/auth': {},
      });

      const res = await controller.get(identifier, withRelated);

      expect(mockUserForge).to.have.been.calledOnce;
      expect(mockUserForge).to.have.been.calledWith(identifier);
      expect(mockUserFetch).to.have.been.calledOnce;
      expect(mockUserFetch).to.have.been.calledWith({ withRelated });
      expect(user.toJSON).to.have.been.calledOnce;
      expect(res).to.deep.equal({ id: 'foo' });
    });

    it('should return null if no user is found', async () => {
      const mockUserFetch = sandbox.stub().resolves(undefined);
      const mockUserForge = sandbox.stub().returns({ fetch: mockUserFetch });
      const mockUserModel = { forge: mockUserForge };
      const identifier = { email: 'foo@example.com' };
      const withRelated = ['auth'];
      const controller = proxy('../../../controllers/users', {
        '../models/user': mockUserModel,
        '../models/auth': {},
      });

      const res = await controller.get(identifier, withRelated);

      expect(mockUserForge).to.have.been.calledOnce;
      expect(mockUserForge).to.have.been.calledWith(identifier);
      expect(mockUserFetch).to.have.been.calledOnce;
      expect(mockUserFetch).to.have.been.calledWith({ withRelated });
      expect(res).to.equal(null);
    });
  });

  describe('getAll', () => {
    it('should return the matching user as JSON', async () => {
      const users = {
        toJSON: sandbox.stub().returns([{
          id: 'foo',
        }]),
      };
      const mockUserFetchAll = sandbox.stub().resolves(users);
      const mockUserWhere = sandbox.stub().returns({ fetchAll: mockUserFetchAll });
      const mockUserModel = { where: mockUserWhere };
      const identifier = { email: 'foo@example.com' };
      const withRelated = ['auth'];
      const controller = proxy('../../../controllers/users', {
        '../models/user': mockUserModel,
        '../models/auth': {},
      });

      const res = await controller.getAll(identifier, withRelated);

      expect(mockUserWhere).to.have.been.calledOnce;
      expect(mockUserWhere).to.have.been.calledWith(identifier);
      expect(mockUserFetchAll).to.have.been.calledOnce;
      expect(mockUserFetchAll).to.have.been.calledWith({ withRelated });
      expect(users.toJSON).to.have.been.calledOnce;
      expect(res).to.deep.equal([{ id: 'foo' }]);
    });

    it('should return null if no user is found', async () => {
      const mockUserFetchAll = sandbox.stub().resolves(undefined);
      const mockUserWhere = sandbox.stub().returns({ fetchAll: mockUserFetchAll });
      const mockUserModel = { where: mockUserWhere };
      const identifier = { email: 'foo@example.com' };
      const withRelated = ['auth'];
      const controller = proxy('../../../controllers/users', {
        '../models/user': mockUserModel,
        '../models/auth': {},
      });

      const res = await controller.getAll(identifier, withRelated);

      expect(mockUserWhere).to.have.been.calledOnce;
      expect(mockUserWhere).to.have.been.calledWith(identifier);
      expect(mockUserFetchAll).to.have.been.calledOnce;
      expect(mockUserFetchAll).to.have.been.calledWith({ withRelated });
      expect(res).to.deep.equal([]);
    });
  });

  describe('getExtended', () => {
    let controllers;
    const userInstance = {};
    const userModel = class { constructor() { return userInstance; }};
    // eslint-disable-next-line func-style
    before(() => {
      controllers = proxy('../../../controllers/users', {
        '../models/auth': {},
        '../models/user': userModel,
      });
    });

    beforeEach(() => {
      userInstance.platformUsers = sandbox.stub().returns(userInstance);
      userInstance.orderBy = sandbox.stub().returns(userInstance);
      userInstance.fetchPage = sandbox.stub().returns(userInstance);
      userInstance.query = sandbox.stub().returns(userInstance);
      userInstance.andWhere = sandbox.stub().returns(userInstance);
      userInstance.query = sandbox.stub()
        .callsArgWith(0, userInstance)
        .returns(userInstance);
    });

    it('should fetch Page with default params', async () => {
      await controllers.getExtended({ query: {} });
      expect(userInstance.andWhere).to.have.been.calledOnce;
      expect(userInstance.orderBy).to.have.been.calledWith('created_at', 'desc');
      expect(userInstance.fetchPage).to.have.been.calledWith({ pageSize: 25, page: 1, withRelated: ['membership'] });
    });
    it('should accept params to customize the search', async () => {
      await controllers.getExtended({ query: { gender: 'snail' }, page: 2, limit: 50 });
      expect(userInstance.andWhere).to.have.been.calledTwice;
      expect(userInstance.andWhere).to.have.been.calledWith('gender', '=', 'snail');
      expect(userInstance.orderBy).to.have.been.calledWith('created_at', 'desc');
      expect(userInstance.fetchPage).to.have.been.calledWith({ pageSize: 50, page: 2, withRelated: ['membership'] });
    });
  });
});
