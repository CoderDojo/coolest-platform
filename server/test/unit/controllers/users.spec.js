const proxy = require('proxyquire').noCallThru();

describe('users controllers', () => {
  const sandbox = sinon.sandbox.create();
  describe('post', () => {
    beforeEach(() => {
      sandbox.reset();
    });
    it('should create an User', async () => {
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
      const reqMock = {
        body: {
          email,
        },
      };
      const jsonReqMock = sandbox.stub().returns({ id: 1, email });
      const statusResMock = sandbox.stub().returns({ json: jsonReqMock });
      const resMock = { status: statusResMock };
      const nextMock = sandbox.stub();

      await controllers.post(reqMock, resMock, nextMock);

      expect(mockUserModel).to.have.been.calledOnce;
      expect(mockUserModel).to.have.been.calledWith({ email });
      expect(mockUserSave).to.have.been.calledOnce;
      expect(statusResMock).to.have.been.calledOnce;
      expect(statusResMock).to.have.been.calledWith(200);
      expect(jsonReqMock).to.have.been.calledOnce;
      expect(jsonReqMock).to.have.been.calledWith({ user: { id: 1, email }, auth: { id: 'auth', user_id: 1, token: 'imbatman' } });
    });

    it('should return 409 if the User already exists', (done) => {
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
      const reqMock = {
        body: {
          email,
        },
      };
      const resMock = {};
      controllers.post(reqMock, resMock, (_err) => {
        expect(mockUserModel).to.have.been.calledOnce;
        expect(mockUserModel).to.have.been.calledWith({ email });
        expect(mockUserSave).to.have.been.calledOnce;
        expect(_err.message).to.equal('User already exists');
        expect(_err.status).to.equal(409);
        done();
      });
    });

    it('should call next on erroneous behavior', (done) => {
      const err = new Error('Fake err');
      const expectedErr = new Error('Error while saving a user.');
      const mockUserSave = sandbox.stub().rejects(err);
      const mockUserModel = sandbox.stub().returns({
        save: mockUserSave,
      });
      const controllers = proxy('../../../controllers/users', {
        '../models/user': mockUserModel,
        '../models/auth': {},
      });
      const email = 'test@test.com';
      const reqMock = {
        body: {
          email,
        },
      };
      const resMock = {};

      controllers.post(reqMock, resMock, (_err) => {
        expect(mockUserModel).to.have.been.calledOnce;
        expect(mockUserModel).to.have.been.calledWith({ email });
        expect(mockUserSave).to.have.been.calledOnce;
        expect(_err.message).to.equal(expectedErr.message);
        done();
      });
    });
  });
});
