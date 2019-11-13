<template>
  <div v-if="event && project">
    <div class="row">
      <div class="col">
        <h1>{{ titleCopy }} {{ event.name }}!</h1>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <p>{{ successCopy }} "{{ project.name }}" for {{ event.name }}. It's a full day of fun on {{ formattedDate }} at the {{ event.location }}. For more information on the event check out <a :href="`https://${event.homepage}`">{{ event.homepage }}</a>. The next step: have fun and keep building your project!</p>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <p>We've sent you a confirmation email, and we'll be in contact soon with further details.</p>
      </div>
    </div>
    <div v-if="event.requiresApproval" class="row">
      <div class="col">
        <p>You will be contacted by the Coolest Projects team if your project is accepted.</p>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <p>The project supervisor and participants do not need a ticket.
          <span v-if="event.externalTicketingUri">Anyone else who wants to come to the event needs to <a :href="event.externalTicketingUri">book a ticket</a>.</span>
        If you want to manage multiple projects you can add more by clicking the button below.</p>
      </div>
    </div>
    <div class="row row-no-margin">
      <div class="col-1fr"></div>
      <div class="col-3fr">
        <router-link class="btn btn-primary-outline full-width-block" :to="{ name: 'ProjectList', params: { _event: event, eventSlug } }">Manage your projects</router-link>
      </div>
      <div class="col-1fr"></div>
    </div>
  </div>
</template>

<script>
  import FetchProjectMixin from '@/project/FetchProjectMixin';

  export default {
    name: 'CreateProjectCompleted',
    mixins: [FetchProjectMixin],
    computed: {
      successCopy() {
        return this.event.requiresApproval ? 'Thanks for submitting' : "Congratulations, you've succesfully registered";
      },
      titleCopy() {
        return this.event.requiresApproval ? 'You\'ve applied for' : 'You\'ve registered for';
      },
    },
  };
</script>

<style scoped>
  .share_image {
    width: 100%;
  }
</style>
