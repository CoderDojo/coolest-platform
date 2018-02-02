<template>
  <div v-if="event && project">
    <div class="row">
      <div class="col text-center">
        <h1>You're coming to {{ event.name }}!</h1>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <p>Congratulations, you've succesfully registered "{{ project.name }}" for {{ event.name }}. It's a full day of fun on {{ eventDateFormatted }} in the {{ event.location }}. For any more information on the event check out <a href="https://www.coolestprojects.org">www.coolestprojects.org</a>.
The next step, have fun and keep building your project!</p>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <p>We've sent you a confirmation email and we'll be in contact soon with further details.</p>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <p>The project supervisor and participants do not need a ticket. For anyone else who wants to come on the day they need to <a href="https://ti.to/coderdojo-coolest-projects/coolest-projects-international-2018">book a ticket</a>. If you want to manage multiple projects you can add more by clicking the button below.</p>
      </div>
    </div>
    <div class="row row-no-margin">
      <div class="col-1fr"></div>
      <div class="col-3fr">
        <router-link class="btn btn-primary-outline full-width-block" :to="{ name: 'ProjectList', params: { _event: event, eventSlug } }">Register a new project</router-link>
      </div>
      <div class="col-1fr"></div>
    </div>
  </div>
</template>

<script>
  import moment from 'moment';
  import FetchProjectMixin from '@/project/FetchProjectMixin';

  export default {
    name: 'CreateProjectCompleted',
    mixins: [FetchProjectMixin],
    computed: {
      eventDateFormatted() {
        return moment.utc(this.event.date).format('MMM Do');
      },
    },
  };
</script>
