<template>
  <div>
    <h2>Register or edit projects for {{ event.name }}</h2>
    <div v-if="error && error.status === 409">
      <p>It looks like you've already registered a project with us. We've just sent an email to {{ email }} with a unique link. Click the link in your email to edit your project or create an additional one!</p>
    </div>
    <form v-else-if="event" @submit.prevent="onSubmit">
      <div class="row">
        <div class="col">
          <label>This form is to register or edit a project for Coolest Projects International 2018 which will be held on Saturday 26th May 2018 in RDS Simmonscourt, Dublin, Ireland. Just one person should register for each project.</label>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <input type="email" v-model="email" class="full-width-block" placeholder="you@email.com" required />
        </div>
      </div>
      <label class="row row-no-margin">
        <div class="col text-center">
          <input type="checkbox"
            v-model="approval"
            data-vv-name="approval"
            v-validate="'required'"
            :class="{ error: errors.has('approval') }"
            name="approval"/>
        </div>
        <div class="col-6fr">
          <p for="approval">By selecting this you are agreeing that you are 13 or over, and are happy to be contacted about this project, Coolest Projects information and related news.</p>
          <span class="error-message" v-show="errors.has('approval:required')">* We need your permission to contact you. Please accept the terms and conditions.</span>
        </div>
      </label>
      <div class="row row-double-margin">
        <div class="col text-center">
          <button type="submit" class="btn btn-primary" :class="{ disabled: !approval }">Next step – project details</button>
        </div>
      </div>
      <div v-if="error" class="row error-message">
        <div class="col">
          <p v-if="$route.query.authFailed">
            Sorry! That link you clicked was out of date. If you just re-enter your email here you'll get a new link to edit your projects or add a new project.
          </p>
          <p v-else-if="error && error.status !== 409">
            Sorry. There was an problem registering your email, please contact <a href="email:hello@coolestprojects.org">hello@coolestprojects.org</a> so we can help you.
          </p>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
  import Cookie from 'js-cookie';
  import UserService from '@/user/service';
  import FetchEventMixin from '@/event/FetchEventMixin';

  export default {
    name: 'Auth',
    mixins: [FetchEventMixin],
    data() {
      return {
        email: null,
        error: null,
        approval: false,
      };
    },
    methods: {
      async onSubmit() {
        const valid = await this.$validator.validateAll();
        if (valid) {
          try {
            const user = (await UserService.create(this.email, this.eventSlug)).body;
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
        }
      },
    },
  };
</script>
