<template>
  <form @submit.prevent="login" class="center-grid">
    <div class="center-grid__content">
      <div class="row">
        <div class="col">
          <div class="text-center">
            <img class="logo" src="../../assets/CoolestProjectsLogo.png" />
          </div>
          <p v-if="$route.query.redirect" class="error-message text-center">You must be logged in to view this page.</p>
          <input type="email" v-model="email" class="full-width-block" placeholder="Email" />
          <input type="password" v-model="password" class="full-width-block" placeholder="Password" />
          <div class="text-center">
            <button type="submit" class="btn btn-primary">Login</button>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>

<script>
  import AdminAuthService from './service';

  export default {
    name: 'AdminLogin',
    data() {
      return {
        email: null,
        password: null,
      };
    },
    methods: {
      async login() {
        const loggedIn = await AdminAuthService.login(this.email, this.password);
        if (loggedIn) {
          this.$router.replace(this.$route.query.redirect || { name: 'Admin' });
        } else {
          // eslint-disable-next-line no-alert
          alert('Invalid login');
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import '../../assets/scss/main.scss';

  .logo {
    max-width: 180px;
    margin: 20px;
  }
</style>
