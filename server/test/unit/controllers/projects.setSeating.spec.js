const proxy = require('proxyquire').noCallThru();

describe('projects controllers: setSeatingPerCategory', () => {
  let controllers;
  let sandbox;
  const projectModel = class {
    constructor() { return projectModel; }
  };
  const seatModel = {};
  let seatModelConstructor;
  before(() => {
    sandbox = sinon.createSandbox();
  });
  beforeEach(() => {
    projectModel.ageGroup = sandbox.stub().returns(projectModel);
    projectModel.where = sandbox.stub().returns(projectModel);
    projectModel.orderBy = sandbox.stub().returns(projectModel);
    projectModel.fetchAll = sandbox.stub().returns(projectModel);
    seatModelConstructor = sandbox.stub().returns(seatModel);
    seatModel.save = sandbox.stub().returns(seatModel);
    seatModel.constructor = sandbox.stub().returns(seatModel);
    controllers = proxy('../../../controllers/projects', {
      '../models/user': {},
      '../models/project': projectModel,
      '../models/seat': seatModelConstructor,
    });
  });
  afterEach(() => {
    sandbox.restore();
  });
  it('should assign seats without filter', async () => {
    projectModel.fetchAll.resolves({ models: new Array(10).fill({ attributes: { id: 1 } }) });
    await controllers.setSeating('BANANA', null, 10, '');
    expect(projectModel.ageGroup).to.have.been.calledOnce;
    expect(projectModel.where).to.have.been.calledThrice;
    expect(projectModel.where.getCall(0)).to.have.been.calledWith('deleted_at', null);
    expect(projectModel.where.getCall(1)).to.have.been.calledWith('status', '!=', 'canceled');
    expect(projectModel.where.getCall(2)).to.have.been.calledWith('category', 'BANANA');
    expect(projectModel.orderBy).to.have.been.calledOnce;
    expect(projectModel.orderBy).to.have.been.calledWith('org_ref', 'DESC');
    expect(projectModel.fetchAll).to.have.been.calledOnce;
    expect(projectModel.fetchAll).to.have.been.calledWith({ withRelated: ['seat'] });
    expect(seatModel.save).to.have.been.callCount(10);
  });
  it('should assign seats with a single filter', async () => {
    projectModel.fetchAll.resolves({ models: new Array(10).fill({ attributes: { id: 1 } }) });
    await controllers.setSeating('BANANA', ['age', '<', 10], 10, '');
    expect(projectModel.ageGroup).to.have.been.calledOnce;
    expect(projectModel.where).to.have.been.callCount(4);
    expect(projectModel.where.getCall(0)).to.have.been.calledWith('deleted_at', null);
    expect(projectModel.where.getCall(1)).to.have.been.calledWith('status', '!=', 'canceled');
    expect(projectModel.where.getCall(2)).to.have.been.calledWith('category', 'BANANA');
    expect(projectModel.where.getCall(3)).to.have.been.calledWith('age', '<', 10);
    expect(projectModel.orderBy).to.have.been.calledOnce;
    expect(projectModel.orderBy).to.have.been.calledWith('org_ref', 'DESC');
    expect(projectModel.fetchAll).to.have.been.calledOnce;
    expect(projectModel.fetchAll).to.have.been.calledWith({ withRelated: ['seat'] });
    expect(seatModelConstructor).to.have.been.callCount(10);
    expect(seatModelConstructor.getCall(0)).to.have.been.calledWith({ project_id: 1, seat: 'BANANA-10' });
    expect(seatModelConstructor.getCall(9)).to.have.been.calledWith({ project_id: 1, seat: 'BANANA-19' });
    expect(seatModel.save).to.have.been.callCount(10);
  });
  it('should assign seats with multiple filters', async () => {
    projectModel.fetchAll.resolves({ models: new Array(10).fill({ attributes: { id: 1 } }) });
    await controllers.setSeating('BANANA', [['age', '<', 10], ['age', '>', 8]], 10, '');
    expect(projectModel.ageGroup).to.have.been.calledOnce;
    expect(projectModel.where).to.have.been.callCount(5);
    expect(projectModel.where.getCall(0)).to.have.been.calledWith('deleted_at', null);
    expect(projectModel.where.getCall(1)).to.have.been.calledWith('status', '!=', 'canceled');
    expect(projectModel.where.getCall(2)).to.have.been.calledWith('category', 'BANANA');
    expect(projectModel.where.getCall(3)).to.have.been.calledWith('age', '<', 10);
    expect(projectModel.where.getCall(4)).to.have.been.calledWith('age', '>', 8);
    expect(projectModel.orderBy).to.have.been.calledOnce;
    expect(projectModel.orderBy).to.have.been.calledWith('org_ref', 'DESC');
    expect(projectModel.fetchAll).to.have.been.calledOnce;
    expect(projectModel.fetchAll).to.have.been.calledWith({ withRelated: ['seat'] });
    expect(seatModelConstructor).to.have.been.callCount(10);
    expect(seatModelConstructor.getCall(0)).to.have.been.calledWith({ project_id: 1, seat: 'BANANA-10' });
    expect(seatModelConstructor.getCall(9)).to.have.been.calledWith({ project_id: 1, seat: 'BANANA-19' });
    expect(seatModel.save).to.have.been.callCount(10);
  });
});
