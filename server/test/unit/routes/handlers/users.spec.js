const proxy = require('proxyquire');

describe('users handlers', () => {
  const sandbox = sinon.sandbox.create();
  describe('post', () => {
    beforeEach(() => {
      sandbox.reset();
    });
    it('should create an User', async () => {
      const email = 'test@test.com';
      const mockUserSave = sandbox.stub().resolves({ id: 1, email });
      const mockUserModel = sandbox.stub().returns({
        save: mockUserSave,
      });
      const handlers = proxy('../../../../routes/handlers/users', {
        '../../models/user': mockUserModel,
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

      await handlers.post(reqMock, resMock, nextMock);

      expect(mockUserModel).to.have.been.calledOnce;
      expect(mockUserModel).to.have.been.calledWith({ email });
      expect(mockUserSave).to.have.been.calledOnce;
      expect(statusResMock).to.have.been.calledOnce;
      expect(statusResMock).to.have.been.calledWith(200);
      expect(jsonReqMock).to.have.been.calledOnce;
      expect(jsonReqMock).to.have.been.calledWith({ id: 1, email });
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
      const handlers = proxy('../../../../routes/handlers/users', {
        '../../models/user': mockUserModel,
      });
      const email = 'test@test.com';
      const reqMock = {
        body: {
          email,
        },
      };
      const jsonReqMock = sandbox.stub().returns({ email });
      const statusResMock = sandbox.stub().returns({ json: jsonReqMock });
      const resMock = { status: statusResMock };
      const nextMock = sandbox.stub();

      await handlers.post(reqMock, resMock, nextMock);

      expect(mockUserModel).to.have.been.calledOnce;
      expect(mockUserModel).to.have.been.calledWith({ email });
      expect(mockUserSave).to.have.been.calledOnce;
      expect(statusResMock).to.have.been.calledOnce;
      expect(statusResMock).to.have.been.calledWith(409);
      expect(jsonReqMock).to.have.been.calledOnce;
      expect(jsonReqMock).to.have.been.calledWith({ status: 409, message: 'User already exists' });
    })
  });
});
