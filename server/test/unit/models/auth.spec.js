const uuid = require('uuid');
const proxy = require('proxyquire');
const jsonwebtoken = require('jsonwebtoken');
const config = require('../../../config/auth');

let Auth;
describe('auth model', () => {
  const sandbox = sinon.sandbox.create();
  before(async () => {
    Auth = proxy('../../../models/auth', {
      '../database': {},
      './user': {},
      jsonwebtoken,
    });
  });
  it('should create an auth and create a new jwt', async () => {
    const attributes = { userId: uuid() };
    const auth = await new Auth(attributes);
    const tokenCreator = sinon.spy(auth, 'createToken');
    auth.trigger('saving', { attributes });
    expect(tokenCreator).to.have.been.calledOnce;
    expect(attributes.token.length).to.equal(189);
  });

  // Ensure this is only called "onSave" elsewhat queries are appended the token
  it('should not create a token when using Auth as a Factory', async () => {
    const auth = await new Auth({ userId: uuid() });
    expect(auth.attributes.token).to.be.undefined;
  });
  afterEach(() => {
    sandbox.reset();
  });

  describe('createToken', () => {
    it('should use jwt', () => {
      const signSpy = sinon.spy(jsonwebtoken, 'sign');
      const userId = 'user1';
      new Auth().createToken(userId);
      expect(signSpy).to.have.been.calledOnce;
      expect(signSpy).to.have.been.calledWith({ data: userId });
    });
  });

  describe('verifyToken', () => {
    it('should use jwt', () => {
      const verifySpy = sinon.spy(jsonwebtoken, 'verify');
      const auth = new Auth();
      const token = auth.createToken('user1');
      auth.verifyToken(token);
      expect(verifySpy).to.have.been.calledOnce;
      expect(verifySpy).to.have.been.calledWith(
        token,
        config.authSecret,
        { maxAge: config.authTimeout },
      );
    });
  });
});
