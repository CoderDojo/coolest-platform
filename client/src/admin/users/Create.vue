<template>
  <div >
    <navigation :eventSlug="eventSlug"></navigation>
    <div>
      <form @submit.prevent="createUser()">
        <label for="email">Email</label>
        <input type="text" name="email" v-model="email"/>
        <label for="password">Password</label>
        <input type="password" name="password" v-model="password"/>
        <input type="submit"/>
      </form>
    </div>
  </div>
</template>

<script>
  import UserService from '@/user/service';
  import FetchEventMixin from '@/event/FetchEventMixin';
  import Navigation from '@/admin/Navigation';

  export default {
    name: 'AdminUserView',
    mixins: [FetchEventMixin],
    components: {
      Navigation,
    },
    data() {
      return {
        email: null,
        password: null,
        error: null,
      };
    },
    methods: {
      async createUser() {
        try {
          await UserService.createAdmin({
            email: this.email,
            password: this.password,
          });
          this.$router.go();
        } catch (err) {
          this.error = err;
        }
      },
    },
  };
</script>
