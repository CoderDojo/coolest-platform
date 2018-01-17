const proxy = require('proxyquire');

let Project;
describe('auth model', () => {
  const sandbox = sinon.sandbox.create();
  const logger = {};
  const db = {};
  before(async () => {
    Project = proxy('../../../models/project', {
      '../database': db,
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
  describe('toJSON', () => {
    it('should flatten owner relation', () => {
      const project = new Project();
      project.relations.owner = Project.collection();
      project.relations.owner.add({ id: '1' });
      project.toJSON();
      expect(project.relations.owner).to.be.an('object');
      expect(project.relations.owner.attributes).to.eql({ id: '1' });
    });
    it('shouldnt flatten owner if it\'s not a collection', () => {
      const project = new Project();
      project.relations.owner = new Project({ id: '1' });
      project.toJSON();
      expect(project.relations.owner).to.be.an('object');
      expect(project.relations.owner.attributes).to.eql({ id: '1' });
    });
    it('should flatten supervisor relation', () => {
      const project = new Project();
      project.relations.supervisor = Project.collection();
      project.relations.supervisor.add({ id: '1' });
      project.toJSON();
      expect(project.relations.supervisor).to.be.an('object');
      expect(project.relations.supervisor.attributes).to.eql({ id: '1' });
    });
    it('shouldnt flatten supervisor if it\'s not a collection', () => {
      const project = new Project();
      project.relations.supervisor = new Project({ id: '1' });
      project.toJSON();
      expect(project.relations.supervisor).to.be.an('object');
      expect(project.relations.supervisor.attributes).to.eql({ id: '1' });
    });
  });
});
