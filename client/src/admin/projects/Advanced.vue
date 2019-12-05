<template>
  <div>
    <navigation :eventSlug="eventSlug">
      <li class="nav-item">
      </li>
      <li class="nav-item">
        <a v-show="confirmationEmailSendState === 'visible'" href="#" @click.prevent="sendConfirmAttendanceEmails" class="nav-link">Send Confirmation Emails</a>
        <a v-show="confirmationEmailSendState === 'sending'" class="nav-link"><i class="fa fa-spinner fa-pulse fa-fw"></i> Sending</a>
        <a v-show="confirmationEmailSendState === 'sent'" class="nav-link">Confirmation emails sent!</a>
      </li>
      <li class="nav-item">
        <button @click="generateSeating()" :disabled="event.seatingPrepared" :class="{'nav-link__btn--stroke' : event.seatingPrepared}" class="nav-link nav-link__btn"><i class="fa fa-map-o"></i> Generate seating</button>
      </li>
      <li class="nav-item">
        <router-link :to="{ name: 'AdminProjects' }" class="nav-link">Projects</router-link>
      </li>
    </navigation>
    <div class="container-fluid">
      <h2>Event Details</h2>
      <ul>
        <li>Name: {{ event.name }}</li>
        <li>Location: {{ event.location }}</li>
        <li>Event date: {{ formattedEventDate }}</li>
        <li>Registration closed: {{ formattedRegistrationClosed }}</li>
        <li>Projects Frozen: {{ formattedEventFrozen }}</li>
        <li>Categories: {{ event.categories }}</li>
        <li>Homepage: {{ event.homepage }}</li>
        <li>Contact: {{ event.contact }}</li>
        <li>Ticketing URL: {{ event.external_ticketing_uri }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
  import moment from 'moment-timezone';

  import Navigation from '@/admin/Navigation';
  import FetchEventMixin from '@/event/FetchEventMixin';
  import AdminEventsService from '@/admin/events/service';
  import eventService from '@/event/service';
  import Organisations from '@/project/Organisations';


  export default {
    name: 'AdminProjectsAdvanced',
    mixins: [FetchEventMixin, Organisations],
    components: {
      Navigation,
    },
    data() {
      return {
        confirmationEmailSendState: 'visible',
      };
    },
    computed: {
      formattedEventDate() {
        return this.formatDate(this.event.date, this.event.tz);
      },
      formattedRegistrationClosed() {
        return this.formatDate(this.event.registrationEnd, this.event.tz);
      },
      formattedEventFrozen() {
        return this.formatDate(this.event.freezeDate, this.event.tz);
      },
    },
    methods: {
      formatDate(date, tz) {
        return moment(date)
          .tz(tz)
          .format('LLLL zz');
      },
      async sendConfirmAttendanceEmails() {
        let confirmString = 'Clicking OK will send emails to all pending projects.';
        if (this.event.lastConfirmationEmailDate) {
          confirmString += ` The last emails were sent on ${this.event.lastConfirmationEmailDate}`;
        }
        // eslint-disable-next-line no-alert
        if (confirm(confirmString)) {
          this.confirmationEmailSendState = 'sending';
          await AdminEventsService.sendConfirmAttendanceEmails(this.event.id);
          this.confirmationEmailSendState = 'sent';
        }
      },
      async generateSeating() {
        const message = 'This should only be done once. So make sure you have closed all applications before doing this as once the seating order is set it stays set!';
        if (confirm(message)) { // eslint-disable-line no-alert
          this.event = (await eventService.seats.post(this.event.id)).body;
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
.nav-item{
  & .nav-link {
    &__btn{
      background-color: inherit;
      border: none;
      color: white;
      cursor: pointer;
      &--stroke {
        text-decoration: line-through;
      }
    }
  }
}

li {
  list-style: none;
}
</style>
