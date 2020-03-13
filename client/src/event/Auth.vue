<template>
  <div>
    <div>
      <p>We have made the tough decision to cancel {{ event.name }} due to growing concerns related to coronavirus. </p>
      <p>We’re sorry to have to do this, but there is just too much uncertainty for us to continue to ask young people, parents, mentors, and volunteers to make travel and other arrangements.</p>
    <p><a href="https://www.raspberrypi.org/blog/update-about-our-events/">Here is our CEO Philip Colligan’s message about this.</a></p>
    </div>
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
    computed: {
      titleActionCopy() {
        return this.event.requiresApproval ? 'Apply' : 'Register or edit projects';
      },
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
<style lang="scss" scoped>
  p {
    margin: 16px 0;
  }

  .list {
    padding-left: 16px;
    &> li {
      margin-top: 8px;
    }
  }
</style>
