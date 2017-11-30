const uuid = require('uuid');
const proxy = require('proxyquire');
const mockDB = require('../../database');

let Auth;
let connection;
describe('auth model', () => {
  const sandbox = sinon.sandbox.create();
  before(async () => {
    connection = await mockDB;
    Auth = proxy('../../../models/auth', {
      '../database': connection,
    });
  });
  it('should create an auth and create a new jwt', async () => {
    const auth = await new Auth({ userId: uuid() }).save();
    expect(auth.attributes.token.length).to.equal(189);
  });

  // Ensure this is only called "onSave" elsewhat queries are appended the token
  it('should not create a token when using Auth as a Factory', async () => {
    const auth = await new Auth({ userId: uuid() });
    expect(auth.attributes.token).to.be.undefined;
  });
  afterEach(() => {
    sandbox.reset();
  });
});
