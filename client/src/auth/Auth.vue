<template>
  <b-form @submit.prevent="onSubmit">
    <b-container>
      <b-row>
        <b-col>
          <b-form-group label="Email" description="Enter your email to get started">
            <b-form-input type="email" v-model="email" placeholder="Email" required />
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-button type="submit" size="lg" variant="primary">Get Started!</b-button>
        </b-col>
      </b-row>
    </b-container>
  </b-form>
</template>

<script>
  import AuthService from '@/auth/service';
  import UserService from '@/user/service';

  export default {
    name: 'Auth',
    data() {
      return {
        email: null,
      };
    },
    methods: {
      async onSubmit() {
        try {
          await AuthService.auth(this.email);
          this.$router.push('auth-email');
        } catch (e) {
          const user = (await UserService.create(this.email)).body;
          this.$router.push({ name: 'ProjectList', query: { authToken: user.auth.token } });
        }
      },
    },
  };
</script>
