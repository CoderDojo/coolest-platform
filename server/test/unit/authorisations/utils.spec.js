const authorisations = require('../../../routes/authorisations/utils');

describe('utils', () => {
  describe('isAllowed', () => {
    const sandbox = sinon.sandbox.create();
    const areAnyRolesAllowed = sandbox.stub();
    const aclMock = {
      areAnyRolesAllowed,
    };

    afterEach(() => {
      sandbox.reset();
    });

    beforeEach(() => {
      areAnyRolesAllowed.callsFake((role, path, method, cb) => {
        cb(null, true);
      });
    });

    it('should refuse on route requiring a role', () => {
      const user = { role: 'basic' };
      const route = { path: '/api/v1/event' };
      const method = 'GET';
      const reqMock = { user, route, method };
      const resMock = {};
      const nextMock = sandbox.stub();
      authorisations.isAllowed(aclMock)(reqMock, resMock, nextMock);

      expect(nextMock).to.have.been.calledOnce;
      expect(areAnyRolesAllowed).to.have.been.calledOnce;
      expect(areAnyRolesAllowed).to.have.been.calledWith(['basic'], route.path, 'get', sinon.match.func);
    });
    it('should default role to guest', () => {
      const user = undefined;
      const route = { path: '/api/v1/event' };
      const method = 'GET';
      const reqMock = { user, route, method };
      const resMock = {};
      const nextMock = sandbox.stub();
      authorisations.isAllowed(aclMock)(reqMock, resMock, nextMock);

      expect(nextMock).to.have.been.calledOnce;
      expect(areAnyRolesAllowed).to.have.been.calledOnce;
      expect(areAnyRolesAllowed).to.have.been.calledWith(['guest'], route.path, 'get', sinon.match.func);
    });

    it('should call return an error if not allowed', () => {
      // scenario case : role is not enough for this route 
      // basic role -> admin route
      const user = { role: 'basic' };
      const route = { path: '/api/v1/admin' };
      const method = 'GET';
      const reqMock = { user, route, method };
      const resMock = {};
      const nextMock = sandbox.stub();
      areAnyRolesAllowed.callsFake((role, path, _method, cb) => {
        cb(null, false);
      });

      authorisations.isAllowed(aclMock)(reqMock, resMock, nextMock);

      expect(nextMock).to.have.been.calledOnce;
      expect(nextMock.getCall(0).args[0].message).to.equal('Forbidden');
      expect(nextMock.getCall(0).args[0].status).to.equal(403);
      expect(areAnyRolesAllowed).to.have.been.calledOnce;
      expect(areAnyRolesAllowed).to.have.been.calledWith(['basic'], route.path, 'get', sinon.match.func);
    });
  });
});
