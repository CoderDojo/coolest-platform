const proxy = require('proxyquire').noCallThru();
const acl = require('acl');

describe('authorisations: project', () => {
  describe('isAllowed', () => {
    const sandbox = sinon.sandbox.create();
    const utils = {};
    let authorisations;
    afterEach(() => {
      sandbox.reset();
    });

    beforeEach(() => {
      authorisations = proxy('../../../routes/authorisations/projects', {
        './utils': utils,
        acl,
      });
    });

    it('should allow if user is owner', () => {
      const id = '111';
      const userId = '222';
      const project = {
        isOwner: sandbox.stub(),
      };
      utils.isAllowed = sinon.stub().returns(sinon.stub());
      utils.disallowed = sinon.stub();
      project.isOwner.returns(true);
      const req = {
        params: { id },
        user: { userId },
        app: {
          locals: { project },
        },
      };
      const next = sandbox.stub();

      authorisations.isAllowed(req, {}, next);
      expect(project.isOwner).to.have.been.calledOnce;
      expect(project.isOwner).to.have.been.calledWith(userId);
      expect(utils.isAllowed).to.not.have.been.called;
      expect(utils.disallowed).to.not.have.been.called;
      expect(next).to.have.been.calledOnce;
      expect(next.getCall(0).args.length).to.equal(0);
    });

    it('should disallow if userr is not the owner', () => {
      const id = '111';
      const userId = '222';
      const project = {
        isOwner: sandbox.stub(),
      };
      utils.isAllowed = sinon.stub().returns(sinon.stub());
      utils.disallowed = sinon.stub();
      project.isOwner.returns(false);
      const req = {
        params: { id },
        user: { userId },
        app: {
          locals: { project },
        },
      };
      const next = sandbox.stub();

      authorisations.isAllowed(req, {}, next);
      expect(project.isOwner).to.have.been.calledOnce;
      expect(project.isOwner).to.have.been.calledWith(userId);
      expect(utils.isAllowed).to.not.have.been.called;
      expect(utils.disallowed).to.have.been.called;
    });

    it('should check roles if there is no id', () => {
      const userId = '222';
      const project = {
        isOwner: sandbox.stub(),
      };
      const isAllowedCb = sinon.stub();
      utils.isAllowed = sinon.stub().returns(isAllowedCb);
      utils.disallowed = sinon.stub();
      project.isOwner.returns(false);
      const req = {
        params: {},
        user: { userId },
        app: {
          locals: { project },
        },
      };
      const next = sandbox.stub();

      authorisations.isAllowed(req, {}, next);
      expect(project.isOwner).to.not.have.been.called;
      expect(utils.disallowed).to.not.have.been.called;
      expect(utils.isAllowed).to.have.been.calledOnce;
      expect(utils.isAllowed).to.have.been.calledWith(sinon.match.object);
      expect(isAllowedCb).to.have.been.calledOnce;
      expect(isAllowedCb).to.have.been.calledWith(req, {}, next);
    });
  });
});
