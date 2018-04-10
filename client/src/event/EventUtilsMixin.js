import moment from 'moment';

export default {
  computed: {
    formattedDate() {
      if (this.event.date) {
        return moment(this.event.date).tz(this.event.tz).format('LLLL zz');
      }
      return '';
    },
  },
  methods: {
    hasQuestion(q) {
      return this.event.questions && this.event.questions.indexOf(q) >= 0;
    },
  },
};
