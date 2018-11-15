const proxy = require('proxyquire');

let User;
describe('user model', () => {
  let sandbox;

  before(async () => {
    sandbox = sinon.createSandbox();
    User = proxy('../../../models/user', {
      '../database': {},
    });
  });

  describe('on:saving', () => {
    it('should format email from attributes to lowerCase', async () => {
      const modelStub = {
        set: sandbox.stub(),
        attributes: {
          email: 'LovvEr@cAse.Me',
        },
      };
      const user = await new User();
      user.trigger('saving', modelStub);
      expect(modelStub.set).to.have.been.calledOnce;
      expect(modelStub.set).to.have.been.calledWith('email', 'lovver@case.me');
    });

    it('should format email from changed to lowerCase if attributes doesn\'t exist', async () => {
      const modelStub = {
        set: sandbox.stub(),
        changed: {
          email: 'LovvEr@cAse.Me',
        },
      };
      const user = await new User();
      user.trigger('saving', modelStub);
      expect(modelStub.set).to.have.been.calledOnce;
      expect(modelStub.set).to.have.been.calledWith('email', 'lovver@case.me');
    });

    it('should not format email where there is none', async () => {
      const modelStub = {
        set: sandbox.stub(),
        attributes: {
          name: 'Memememe',
        },
      };
      const user = await new User();
      user.trigger('saving', modelStub);
      expect(modelStub.set).not.to.have.been.called;
    });
  });

  describe('on:fetching', () => {
    it('should format email on fetch', async () => {
      const optsStub = {
        query: {
          _statements: [
            {
              column: 'user.name',
              value: 'Memememe',
            },
            {
              column: 'user.email',
              value: 'LovvEr@cAse.Me',
            },
          ],
        },
      };
      const user = await new User();
      user.trigger('fetching', {}, {}, optsStub);
      expect(optsStub).to.deep.equal({
        query: {
          _statements: [
            {
              column: 'user.name',
              value: 'Memememe',
            },
            {
              column: 'user.email',
              value: 'lovver@case.me',
            },
          ],
        },
      });
    });
  });

  describe('on:fetching:collection', () => {
    it('should format email on fetch', async () => {
      const optsStub = {
        query: {
          _statements: [
            {
              column: 'name',
              value: 'Memememe',
            },
            {
              column: 'email',
              value: 'LovvEr@cAse.Me',
            },
          ],
        },
      };
      const user = await new User();
      user.trigger('fetching:collection', {}, {}, optsStub);
      expect(optsStub).to.deep.equal({
        query: {
          _statements: [
            {
              column: 'name',
              value: 'Memememe',
            },
            {
              column: 'email',
              value: 'lovver@case.me',
            },
          ],
        },
      });
    });
  });
});
