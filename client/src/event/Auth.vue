<template>
  <form v-if="event" @submit.prevent="onSubmit">
    <h2>Register for {{ event.name }}</h2>
    <div class="row">
      <div class="col">
        <label>This form is to register a project for Coolest Projects International 2018 which will be held on Saturday 26th May 2018 in RDS Simmonscourt, Dublin, Ireland. Just one person should register for each project.</label>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <input type="email" v-model="email" class="full-width-block" placeholder="you@email.com" required />
      </div>
    </div>
    <label class="row row-no-margin">
      <div class="col text-center">
        <input type="checkbox" v-model="approval" name="approval"/>
      </div>
      <div class="col-6fr">
        <p for="approval">By selecting this you are agreeing that you are 13 or over, and are happy to be contacted about this project, Coolest Projects information and related news.</p>
      </div>
    </label>
    <div class="row row-double-margin">
      <div class="col text-center">
        <button type="submit" class="btn btn-primary" :disabled="!approval">Next step – project details</button>
      </div>
    </div>
    <div v-if="error" class="row error-message">
      <div class="col">
        <p v-if="error.status === 409">
          Looks like you've already created a project. Don't worry if you need to change some project information. We'll email you in the next few weeks showing you how you can edit your project details.
        </p>
        <p v-else="error.status !== 409">
          Sorry. There was an problem registering your email, please contact <a href="email:hello@coolestprojects.org">hello@coolestprojects.org</a> so we can help you.
        </p>
      </div>
      </div>
    </div>
  </form>
</template>

<script>
  import Cookie from 'js-cookie';
  import UserService from '@/user/service';
  import EventService from '@/event/service';

  export default {
    name: 'Auth',
    props: {
      eventSlug: {
        required: true,
        type: String,
      },
    },
    data() {
      return {
        email: null,
        event: null,
        error: null,
        approval: false,
      };
    },
    methods: {
      async fetchEvent() {
        this.event = (await EventService.get(this.eventSlug)).body;
      },
      async onSubmit() {
        try {
          const user = (await UserService.create(this.email)).body;
          Cookie.set('authToken', user.auth.token);
          this.$ga.event({
            eventCategory: 'ProjectRegistration',
            eventAction: 'NewUserAuth',
            eventLabel: this.eventSlug,
          });
          this.$router.push({ name: 'CreateProject', params: { eventSlug: this.eventSlug } });
        } catch (e) {
          this.error = e;
        }
      },
    },
    created() {
      this.fetchEvent();
    },
  };
</script>
