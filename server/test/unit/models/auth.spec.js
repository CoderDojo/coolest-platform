const proxy = require('proxyquire');

let User;
describe('auth model', () => {
  before(async () => {
    User = proxy('../../../models/user', {
      '../database': {},
    });
  });
  describe('on:saving', () => {
  
    it('should format email to lowerCase', async () => {
      const attributes = { email: 'LovvEr@cAse.Me' };
      const user = await new User(attributes);
      user.emit('saving', { attributes });
      expect(attributes.email).to.equal('lovver@case.me');
    });
    it('should not format email where there is none', async () => {
      const attributes = { name: 'memmememe' };
      const user = await new User(attributes);
      user.emit('saving', { attributes });
      expect(attributes.email).to.equal(undefined);
    });
  });
  describe('on:fetching', () => {
    it('should format email on fetch', async () => {
      const attributes = { name: 'memmememe' };
      const user = await new User(attributes);
      const mockOpts = {
        query: {} 
      }
      user.emit('fetching', { attributes, {}, mockOpts });
      expect(attributes.email).to.equal(undefined);
    });
  });
});
