const proxy = require('proxyquire').noCallThru();

describe('router: project', () => {
  let handlers;
  describe('PATCH /:id/status', () => {
    let handler;
    const projectController = class {};
    let sandbox;
    let errorHandler;
    before(() => {
      sandbox = sinon.sandbox.create();
      handlers = (proxy('../../../routes/handlers/projects', {
        '../../controllers/projects': projectController,
      })).patchStatus;
      errorHandler = sandbox.stub();
      handler = (req, res, next) => {
        return handlers[0](req, res, next)
          .then(() => handlers[1](req, res, next))
          .catch(err => errorHandler(err));
      };
    });
    it('should save the status only', async () => {
      const updateController = sandbox.stub();
      const id = 'faaa';
      const res = { id, name: 'proj' };
      const originalProject = { id, name: 'oldproj' };
      const body = { status: 'confirmed', banana: true };
      projectController.update = updateController.resolves(res);
      const nextMock = sandbox.stub();
      const mockReq = {
        params: { id },
        body,
        app: {
          locals: {
            project: originalProject,
          },
        },
      };
      const send = sandbox.stub();
      const mockRes = {
        locals: {},
        status: sandbox.stub().returns({ send }),
      };
      await handler(mockReq, mockRes, nextMock);
      expect(updateController).to.have.been.calledOnce;
      expect(updateController).to.have.been.calledWith(originalProject, { status: 'confirmed' });
      expect(mockRes.status).to.have.been.calledOnce;
      expect(mockRes.status).to.have.been.calledWith(200);
      expect(send).to.have.been.calledOnce;
      expect(send).to.have.been.calledWith();
    });

    it('should return an error', async () => {
      const updateController = sandbox.stub();
      const id = 'faaa';
      const originalProject = { id, name: 'oldproj' };
      const body = { status: 'confirmed', banana: true };
      const err = new Error('Fake err');
      projectController.update = updateController.rejects(err);
      const nextMock = sandbox.stub();
      const error = sandbox.stub();
      const mockReq = {
        params: { id },
        body,
        app: {
          locals: {
            project: originalProject,
            logger: { error },
          },
        },
      };
      const mockRes = {
        locals: {},
      };
      await handler(mockReq, mockRes, nextMock);
      expect(updateController).to.have.been.calledOnce;
      expect(updateController).to.have.been.calledWith(originalProject, { status: 'confirmed' });
      expect(nextMock).to.have.been.calledOnce;
      expect(nextMock.getCall(0).args[0].message).to.equal('Error while saving your project.');
    });
  });
});
