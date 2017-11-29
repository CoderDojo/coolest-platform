const proxy = require('proxyquire');
const uuid = require('uuid/v4');

describe('events handlers', () => {
  const sandbox = sinon.sandbox.create();
  describe('get', () => {
    beforeEach(() => {
      sandbox.reset();
    });
    it('should look for an event by its slug or by id', async () => {
      // DATA
      const slug = 'cp-2018';
      const eventId = uuid();
      const reqMock = { params: { slug } };
      const expectedEvent = { id: eventId, name: 'cp-2018', slug };

      // STUBS
      const jsonReqMock = sandbox.stub().resolves(expectedEvent);
      const statusResMock = sandbox.stub().returns({ json: jsonReqMock });
      const mockEventModelFetch = sandbox.stub().resolves(expectedEvent);
      const mockEventModel = sandbox.stub().returns({ fetch: mockEventModelFetch });
      const resMock = { status: statusResMock };
      const handlers = proxy('../../../../routes/handlers/events', {
        '../../models/event': mockEventModel,
      });
      // ACT
      const event = await handlers.get(reqMock, resMock);

      // Build the request
      expect(mockEventModel).to.have.been.calledOnce;
      expect(mockEventModel).to.have.been.calledWith({ slug });
      expect(mockEventModelFetch).to.have.been.calledOnce;


      // Finally return the project/JSON
      expect(statusResMock).to.have.been.calledOnce;
      expect(statusResMock).to.have.been.calledWith(200);
      expect(jsonReqMock).to.have.been.calledOnce;
      expect(jsonReqMock).to.have.been.calledWith(expectedEvent);
      expect(event).to.eql(expectedEvent);
    });
  });
});
