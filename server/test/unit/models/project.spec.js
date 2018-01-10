const proxy = require('proxyquire');

let Project;
describe('auth model', () => {
  const sandbox = sinon.sandbox.create();
  const logger = {};
  before(async () => {
    Project = proxy('../../../models/project', {
      '../database': {},
      '../util/logger': logger,
    });
  });

  describe('isOwner', () => {
    it('should return true if the provided userId is the same as the owner Id', () => {
      const project = new Project();
      project.relations.owner = {};
      project.relations.owner.attributes = {};
      project.relations.owner.attributes.userId = 'aaa';
      expect(project.isOwner('aaa')).to.be.true;
    });

    it('should return false if the provided userId is different from the owner Id', () => {
      const project = new Project();
      project.relations.owner = {};
      project.relations.owner.attributes = {};
      project.relations.owner.attributes.userId = 'aaa';
      expect(project.isOwner('bbb')).to.be.false;
    });
    it('should return false if the owner is not defined', () => {
      const project = new Project();
      logger.error = sandbox.stub();
      expect(project.isOwner('bbb')).to.be.false;
      expect(logger.error).to.have.been.calledOnce;
    });
  });
});
