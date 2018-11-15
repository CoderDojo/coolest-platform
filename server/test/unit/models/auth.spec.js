const uuid = require('uuid');
const proxy = require('proxyquire');
const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../../../config/auth');

let Auth;
describe('auth model', () => {
  const sandbox = sinon.createSandbox();
  before(async () => {
    Auth = proxy('../../../models/auth', {
      '../database': {},
      './user': {},
      jsonwebtoken,
      bcrypt,
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
    afterEach(() => {
      sandbox.reset();
      sandbox.restore();
    });
    it('should return the decrypted token on success', () => {
      const verifySpy = sandbox.spy(jsonwebtoken, 'verify');
      const auth = new Auth();
      const token = auth.createToken('user1');
      const res = Auth.verifyToken(token);
      expect(verifySpy).to.have.been.calledOnce;
      expect(verifySpy).to.have.been.calledWith(
        token,
        config.authSecret,
        { maxAge: config.authTimeout },
      );
      expect(res.data).to.equal('user1');
      expect(Object.keys(res)).to.eql(['data', 'iat', 'exp']);
    });
    it('should throw on error or falsy', () => {
      const verifySpy = sandbox.spy(jsonwebtoken, 'verify');
      const auth = new Auth();
      let token = auth.createToken('user1');
      token = token.substring(1);
      try {
        Auth.verifyToken(token);
      } catch (e) {
        expect(verifySpy).to.have.been.calledOnce;
        expect(verifySpy).to.have.been.calledWith(
          token,
          config.authSecret,
          { maxAge: config.authTimeout },
        );
        expect(e.message).to.equal('invalid token');
      }
    });
  });
  describe('setPassword', () => {
    it('should set a bcrypted password', async () => {
      const genSaltSpy = sinon.spy(bcrypt, 'genSalt');
      const hashSpy = sinon.spy(bcrypt, 'hash');
      const auth = new Auth();

      await auth.setPassword('banana');
      expect(genSaltSpy).to.have.been.calledOnce;
      expect(hashSpy).to.have.been.calledOnce;
      expect(hashSpy).to.have.been.calledWith(
        'banana',
        sinon.match.string,
      );
    });
  });
  describe('verifyPassword', () => {
    it('should use bcrypt', async () => {
      const verifySpy = sinon.spy(bcrypt, 'compare');
      const auth = new Auth();

      await auth.setPassword('banana');
      await auth.verifyPassword('banana');
      expect(verifySpy).to.have.been.calledOnce;
      expect(verifySpy).to.have.been.calledWith(
        'banana',
        auth.attributes.password,
      );
    });
  });
});
