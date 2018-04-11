import EventService from '@/event/service';
import EventUtilsMixin from '@/event/EventUtilsMixin';
import moment from 'moment';

export default {
  mixins: [EventUtilsMixin],
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
  computed: {
    isOpen() {
      return moment.utc() < moment.utc(this.event.registrationEnd);
    },
    isFrozen() {
      return moment.utc() > moment.utc(this.event.freezeDate);
    },
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
