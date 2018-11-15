import userAuthNavGuard from 'inject-loader!@/router/userAuthNavGuard';

describe('adminNavGuard', () => {
  let sandbox;
  let MockVue;
  let MockAuthService;
  let userAuthNavGuardWithMocks;
  let nextStub;
  let toStub;
  let fromStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    toStub = {
      path: '/admin',
      params: {},
      query: {},
    };
    fromStub = {
      path: '/',
    };
    MockVue = {
      http: {
        headers: {
          common: {},
        },
      },
    };
    MockAuthService = {
      authToken: sandbox.stub(),
    };
    userAuthNavGuardWithMocks = userAuthNavGuard({
      vue: MockVue,
      '@/auth/service': MockAuthService,
    }).default;
    nextStub = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should redirect to Index if no authToken is found', async () => {
    // ARRANGE
    sandbox.stub(localStorage, 'getItem').withArgs('authToken').returns(undefined);

    // ACT
    await userAuthNavGuardWithMocks(toStub, fromStub, nextStub);

    // ASSERT
    expect(nextStub).to.have.been.calledOnce;
    expect(nextStub).to.have.been.calledWith({
      name: 'Index',
      replace: true,
      query: {
        authFailed: true,
      },
    });
  });

  it('should redirect to Index if stored authToken is invalid', async () => {
    // ARRANGE
    sandbox.stub(localStorage, 'getItem').withArgs('authToken').returns('user_token');
    MockAuthService.authToken.withArgs('user_token').rejects();

    // ACT
    await userAuthNavGuardWithMocks(toStub, fromStub, nextStub);

    // ASSERT
    expect(nextStub).to.have.been.calledOnce;
    expect(nextStub).to.have.been.calledWith({
      name: 'Index',
      replace: true,
      query: {
        authFailed: true,
      },
    });
  });

  it('should progress if authToken is found in the query string and valid', async () => {
    // ARRANGE
    const userId = 'foo';
    toStub.query.token = 'user_token';
    sandbox.stub(localStorage, 'getItem').withArgs('authToken').returns(undefined);
    sandbox.stub(localStorage, 'setItem');
    MockAuthService.authToken.withArgs('user_token').resolves({ body: { userId } });

    // ACT
    await userAuthNavGuardWithMocks(toStub, fromStub, nextStub);

    // ASSERT
    expect(nextStub).to.have.been.calledOnce;
    expect(nextStub).to.have.been.calledWith(true);
    expect(toStub.params.userId).to.equal(userId);
    expect(MockVue.http.headers.common.Authorization).to.equal('Bearer user_token');
    expect(localStorage.setItem).to.have.been.calledOnce;
    expect(localStorage.setItem).to.have.been.calledWith('authToken', 'user_token');
  });

  it('should progress if authToken is found in local storage and valid', async () => {
    // ARRANGE
    const userId = 'foo';
    sandbox.stub(localStorage, 'getItem').withArgs('authToken').returns('user_token');
    sandbox.stub(localStorage, 'setItem');
    MockAuthService.authToken.withArgs('user_token').resolves({ body: { userId } });

    // ACT
    await userAuthNavGuardWithMocks(toStub, fromStub, nextStub);

    // ASSERT
    expect(nextStub).to.have.been.calledOnce;
    expect(nextStub).to.have.been.calledWith(true);
    expect(toStub.params.userId).to.equal(userId);
    expect(MockVue.http.headers.common.Authorization).to.equal('Bearer user_token');
    expect(localStorage.setItem).to.have.been.calledOnce;
    expect(localStorage.setItem).to.have.been.calledWith('authToken', 'user_token');
  });
});
