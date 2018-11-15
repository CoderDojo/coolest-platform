import adminNavGuard from 'inject-loader!@/router/adminNavGuard';

describe('adminNavGuard', () => {
  let sandbox;
  let MockAdminAuthService;
  let adminNavGuardWithMocks;
  let nextStub;
  const toStub = {
    path: '/admin',
  };
  const fromStub = {
    path: '/',
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    MockAdminAuthService = {
      checkToken: sandbox.stub(),
    };
    adminNavGuardWithMocks = adminNavGuard({
      '@/admin/auth/service': MockAdminAuthService,
    }).default;
    nextStub = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should redirect to AdminLogin if no authToken is found', async () => {
    // ARRANGE
    sandbox.stub(localStorage, 'getItem').withArgs('authToken').returns(undefined);

    // ACT
    await adminNavGuardWithMocks(toStub, fromStub, nextStub);

    // ASSERT
    expect(nextStub).to.have.been.calledOnce;
    expect(nextStub).to.have.been.calledWith({
      name: 'AdminLogin',
      replace: true,
      query: {
        redirect: '/admin',
      },
    });
  });

  it('should redirect to AdminLogin if stored authToken is invalid', async () => {
    // ARRANGE
    sandbox.stub(localStorage, 'getItem').withArgs('authToken').returns('admin_token');
    MockAdminAuthService.checkToken.withArgs('admin_token').resolves(false);

    // ACT
    await adminNavGuardWithMocks(toStub, fromStub, nextStub);

    // ASSERT
    expect(nextStub).to.have.been.calledOnce;
    expect(nextStub).to.have.been.calledWith({
      name: 'AdminLogin',
      replace: true,
      query: {
        redirect: '/admin',
      },
    });
  });


  it('should progress if authToken is found and valid', async () => {
    // ARRANGE
    sandbox.stub(localStorage, 'getItem').withArgs('authToken').returns('admin_token');
    MockAdminAuthService.checkToken.withArgs('admin_token').resolves(true);

    // ACT
    await adminNavGuardWithMocks(toStub, fromStub, nextStub);

    // ASSERT
    expect(nextStub).to.have.been.calledOnce;
    expect(nextStub).to.have.been.calledWith(true);
  });
});
