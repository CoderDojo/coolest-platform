const proxy = require('proxyquire').noCallThru();

describe('projects controllers: setSeatingPerCategory', () => {
  let controllers;
  let sandbox;
  before(() => {
    sandbox = sinon.sandbox.create();
    controllers = proxy('../../../controllers/projects', {
      '../models/user': {},
      '../models/project': {},
    });
  });
  afterEach(() => {
    sandbox.restore();
  });
  it('should call setSeating if the category is not SC', async () => {
    controllers.setSeating = sandbox.stub();
    await controllers.setSeatingPerCategory('BANANA');
    expect(controllers.setSeating).to.have.been.calledOnce;
    expect(controllers.setSeating).to.have.been.calledWith('BANANA', null, 100);
  });

  it('shoud do the age split if the category is SC', async () => {
    const sizeSeed = Math.ceil(Math.random() * 100);
    controllers.setSeating = sandbox.stub().resolves(new Array(sizeSeed).fill(sizeSeed));
    await controllers.setSeatingPerCategory('SC');
    expect(controllers.setSeating).to.have.been.calledTwice;
    expect(controllers.setSeating.getCall(0)).to.have.been.calledWith('SC', ['age', '<=', 11], 100);
    expect(controllers.setSeating.getCall(1)).to.have.been.calledWith('SC', ['age', '>', 11], 100 + sizeSeed);
  });
});
