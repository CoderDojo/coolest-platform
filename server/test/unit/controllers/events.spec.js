const proxy = require('proxyquire').noCallThru();
const uuid = require('uuid/v4');

describe('events controllers', () => {
  const sandbox = sinon.sandbox.create();
  describe('get', () => {
    beforeEach(() => {
      sandbox.reset();
    });
    it('should look for an event by its slug or by id', async () => {
      // DATA
      const slug = 'cp-2018';
      const eventId = uuid();
      const expectedEvent = { id: eventId, name: 'cp-2018', slug };

      // STUBS
      const mockEventModelFetch = sandbox.stub().resolves(expectedEvent);
      const mockEventModel = sandbox.stub().returns({ fetch: mockEventModelFetch });
      const controllers = proxy('../../../controllers/events', {
        '../models/event': mockEventModel,
      });
      // ACT
      const event = await controllers.get({ slug });

      // Build the request
      expect(mockEventModel).to.have.been.calledOnce;
      expect(mockEventModel).to.have.been.calledWith({ slug });
      expect(mockEventModelFetch).to.have.been.calledOnce;


      // Finally return the project/JSON
      expect(event).to.eql(expectedEvent);
    });
  });
});
