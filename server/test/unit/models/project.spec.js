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
      project.relations.owner = Project.collection();
      project.relations.owner.add({ id: 'aaa' });
      expect(project.isOwner('aaa')).to.be.true;
    });

    it('should return false if the provided userId is different from the owner Id', () => {
      const project = new Project();
      project.relations.owner = Project.collection();
      project.relations.owner.add({ id: 'aaa' });
      expect(project.isOwner('bbb')).to.be.false;
    });
    it('should return false if the owner is not defined', () => {
      const project = new Project();
      logger.error = sandbox.stub();
      expect(project.isOwner('bbb')).to.be.false;
      expect(logger.error).to.have.been.calledOnce;
    });
    it('should return false if the owner is not an array', () => {
      const project = new Project();
      project.relations.owner = { id: 'bbb' };
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
  describe('adminView', () => {
    it('should join user for owner & supervisor', () => {
      const project = new Project();
      project.query = sinon.stub().callsArgWith(0, project).returns(project);
      project.columns = sinon.stub().returns(project);
      project.innerJoin = sinon.stub().returns(project);
      project.adminView();
      expect(project.query).to.have.been.calledTwice;
      expect(project.columns).to.have.been.calledOnce;
      expect(project.innerJoin.callCount).to.equal(4);
      expect(project.innerJoin.getCall(0)).to.have.been.calledWith('project_users as opu', sinon.match.func);
      expect(project.innerJoin.getCall(1)).to.have.been.calledWith('user as owner', 'opu.user_id', 'owner.id');
      expect(project.innerJoin.getCall(2)).to.have.been.calledWith('project_users as spu', sinon.match.func);
      expect(project.innerJoin.getCall(3)).to.have.been.calledWith('user as supervisor', 'spu.user_id', 'supervisor.id');
    });
    it('should filter lowercase data and default the table to project', () => {
      const project = new Project();
      project.query = sinon.stub().callsArgWith(0, project).returns(project);
      project.columns = sinon.stub().returns(project);
      project.innerJoin = sinon.stub().returns(project);
      project.andWhere = sinon.stub().returns(project);
      project.adminView({ name: 'Derp' });
      expect(project.query).to.have.been.calledTwice;
      expect(project.columns).to.have.been.calledOnce;
      expect(project.innerJoin.callCount).to.equal(4);
      expect(project.innerJoin.getCall(0)).to.have.been.calledWith('project_users as opu', sinon.match.func);
      expect(project.innerJoin.getCall(1)).to.have.been.calledWith('user as owner', 'opu.user_id', 'owner.id');
      expect(project.innerJoin.getCall(2)).to.have.been.calledWith('project_users as spu', sinon.match.func);
      expect(project.innerJoin.getCall(3)).to.have.been.calledWith('user as supervisor', 'spu.user_id', 'supervisor.id');
      expect(project.andWhere).to.have.been.calledOnce;
      expect(project.andWhere).to.have.been.calledWith(sinon.match.object, 'LIKE', '%derp%');
      expect(project.andWhere.getCall(0).args[0].toString()).to.have.eql('LOWER("project"."name")');
    });
    it('should filter lowercase data and support multiple fields', () => {
      const project = new Project();
      project.query = sinon.stub().callsArgWith(0, project).returns(project);
      project.columns = sinon.stub().returns(project);
      project.innerJoin = sinon.stub().returns(project);
      project.andWhere = sinon.stub().returns(project);
      project.adminView({ name: 'Derp', 'supervisor.email': 'test@' });
      expect(project.query).to.have.been.calledTwice;
      expect(project.columns).to.have.been.calledOnce;
      expect(project.innerJoin.callCount).to.equal(4);
      expect(project.innerJoin.getCall(0)).to.have.been.calledWith('project_users as opu', sinon.match.func);
      expect(project.innerJoin.getCall(1)).to.have.been.calledWith('user as owner', 'opu.user_id', 'owner.id');
      expect(project.innerJoin.getCall(2)).to.have.been.calledWith('project_users as spu', sinon.match.func);
      expect(project.innerJoin.getCall(3)).to.have.been.calledWith('user as supervisor', 'spu.user_id', 'supervisor.id');
      expect(project.andWhere).to.have.been.calledTwice;
      expect(project.andWhere.getCall(0)).to.have.been.calledWith(sinon.match.object, 'LIKE', '%derp%');
      expect(project.andWhere.getCall(0).args[0].toString()).to.have.eql('LOWER("project"."name")');
      expect(project.andWhere.getCall(1)).to.have.been.calledWith(sinon.match.object, 'LIKE', '%test@%');
      expect(project.andWhere.getCall(1).args[0].toString()).to.have.eql('LOWER("supervisor"."email")');
    });
  });
});
