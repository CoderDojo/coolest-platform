const uuid = require('uuid');
const Auth = require('../../../models/auth');

describe('auth model', () => {
  const sandbox = sinon.sandbox.create();
  it('should create an auth and create a new jwt', async () => {
    // DATA
    const auth = await new Auth({ userId: uuid() });
    expect(auth.attributes.token.length).to.equal(189);
  });
  afterEach(() => {
    sandbox.reset();
  });
});
