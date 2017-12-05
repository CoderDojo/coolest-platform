import Vue from 'vue';
import EventService from '@/event/service';

describe('Event service', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.reset();
    sandbox.restore();
  });

  describe('get()', () => {
    it('should get the details for the given eventId', async () => {
      // ARRANGE
      const eventId = 'cp2018';
      sandbox.stub(Vue.http, 'get')
        .withArgs(`/api/v1/events/${eventId}`)
        .resolves('success');

      // ACT
      const response = await EventService.get(eventId);

      // ASSERT
      expect(response).to.equal('success');
    });
  });
});
