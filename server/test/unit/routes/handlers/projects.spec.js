const proxy = require('proxyquire');
const { omit } = require('lodash');

describe('projects handlers', () => {
  const sandbox = sinon.sandbox.create();
  describe('post', () => {
    beforeEach(() => {
      sandbox.reset();
    });
    it('should create a project and its associated users', async () => {
      // DATA
      const eventId = 'eventId';
      const name = 'MyLittleProject';
      const category = 'Flash';
      const dojoId = '';
      const member = {
        firstName: 'member',
        lastName: 'one',
        dob: '2010-09-01T00:00.000Z',
        country: 'FR',
        type: 'member',
      };
      const supervisor = {
        firstName: 'supervisor',
        lastName: 'one',
        dob: '2010-09-01T00:00.000Z',
        type: 'supervisor',
        email: 'a@aa.a',
        phone: '01234567',
      };

      // STUBs
      const mockUserSaveMember = sandbox.stub().resolves({ id: 'user1' });
      const mockUserSaveSupervisor = sandbox.stub().resolves({ id: 'user2' });
      const mockProjectSave = sandbox.stub().resolves({ id: 'project' });
      const mockAttachProject = sinon.stub().resolves({});
      const mockMembersProject = sandbox.stub().returns({
        attach: mockAttachProject,
      });
      // Multiple withArgs must be splitted : https://github.com/sinonjs/sinon/issues/176
      const mockUserModel = sandbox.stub();
      mockUserModel.withArgs(omit(member, ['type'])).returns({
        save: mockUserSaveMember,
      });
      mockUserModel.withArgs(omit(supervisor, ['type'])).returns({
        save: mockUserSaveSupervisor,
      });
      const mockProjectModel = sandbox.stub().returns({
        save: mockProjectSave,
        members: mockMembersProject,
      });
      const handlers = proxy('../../../../routes/handlers/projects', {
        '../../models/user': mockUserModel,
        '../../models/project': mockProjectModel,
      });
      const reqMock = {
        params: { eventId },
        body: {
          name,
          category,
          dojoId,
          users: [member, supervisor],
        },
      };
      const jsonReqMock = sandbox.stub().returns({ id: 'project' });
      const statusResMock = sandbox.stub().returns({ json: jsonReqMock });
      const resMock = { status: statusResMock };
      const nextMock = sandbox.stub();

      // ACT
      await handlers.post(reqMock, resMock, nextMock);

      // First, save the project
      expect(mockProjectModel).to.have.been.calledTwice;
      expect(mockProjectModel.getCall(0).args[0]).to.be.eql({
        eventId,
        name,
        category,
        dojoId,
      });
      expect(mockProjectSave).to.have.been.calledOnce;

      // Then save the new users
      expect(mockUserModel).to.have.been.calledTwice;
      expect(mockUserModel).to.have.been.calledWith(omit(member, ['type']));
      expect(mockUserModel).to.have.been.calledWith(omit(supervisor, ['type']));
      expect(mockUserSaveMember).to.have.been.calledOnce;
      expect(mockUserSaveSupervisor).to.have.been.calledOnce;

      // Then save the associations
      expect(mockProjectModel.getCall(1).args[0]).to.be.eql({ id: 'project' });
      expect(mockMembersProject).to.have.been.calledOnce;
      expect(mockAttachProject).to.have.been.calledOnce;
      expect(mockAttachProject).to.have.been.calledWith([{ user_id: 'user1', type: 'member' }, { user_id: 'user2', type: 'supervisor' }]);

      // Finally return the project/JSON
      expect(statusResMock).to.have.been.calledOnce;
      expect(statusResMock).to.have.been.calledWith(200);
      expect(jsonReqMock).to.have.been.calledOnce;
      expect(jsonReqMock).to.have.been.calledWith({ id: 'project' });
    });
  });
});
