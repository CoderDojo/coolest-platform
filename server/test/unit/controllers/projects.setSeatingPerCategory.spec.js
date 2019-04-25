const proxy = require('proxyquire').noCallThru();
const Category = require('../../../models/category');

describe('projects controllers: setSeatingPerCategory', () => {
  let controllers;
  let sandbox;
  before(() => {
    sandbox = sinon.createSandbox();
    controllers = proxy('../../../controllers/projects', {
      '../models/user': {},
      '../models/project': {},
    });
  });
  afterEach(() => {
    sandbox.restore();
  });
  it('should call setSeating if the category is split', async () => {
    controllers.setSeating = sandbox.stub().resolves(new Array(10).fill(1));
    const cat = new Category('HW');
    await controllers.setSeatingPerCategory(cat);
    expect(controllers.setSeating).to.have.been.calledOnce;
    expect(controllers.setSeating).to.have.been.calledWith('HW', null, 100, '');
  });

  it('shoud call setSeating multiple time if there is an age split', async () => {
    const sizeSeed = Math.ceil(Math.random() * 100);
    controllers.setSeating = sandbox.stub().resolves(new Array(sizeSeed).fill(sizeSeed));
    const cat = new Category('HW', [12, 14, 3]);
    await controllers.setSeatingPerCategory(cat);
    expect(controllers.setSeating).to.have.callCount(4);
    expect(controllers.setSeating.getCall(0)).to.have.been.calledWith('HW', ['age', '<=', 3], 100, 1);
    expect(controllers.setSeating.getCall(1)).to.have.been.calledWith('HW', [['age', '<=', 12], ['age', '>', 3]], 100 + (sizeSeed), 2);
    expect(controllers.setSeating.getCall(2)).to.have.been.calledWith('HW', [['age', '<=', 14], ['age', '>', 12]], 100 + (sizeSeed * 2), 3);
    expect(controllers.setSeating.getCall(3)).to.have.been.calledWith('HW', ['age', '>', 14], 100 + (sizeSeed * 3), 4);
  });
});
