import moment from 'moment';

export default {
  computed: {
    formattedDate() {
      return moment(this.event.date).format('LLLL');
    },
  },
  methods: {
    hasQuestion(q) {
      return this.event.questions && this.event.questions.indexOf(q) >= 0;
    },
  },
};
