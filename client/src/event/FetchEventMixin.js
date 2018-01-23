import EventService from '@/event/service';

export default {
  props: {
    eventSlug: {
      required: true,
      type: String,
    },
    _event: {
      type: Object,
    },
  },
  data() {
    return {
      event: {},
    };
  },
  methods: {
    async fetchEvent() {
      this.event = (await EventService.get(this.eventSlug)).body;
    },
  },
  async created() {
    if (this._event) {
      this.event = this._event;
    } else {
      await this.fetchEvent();
    }
  },
};
