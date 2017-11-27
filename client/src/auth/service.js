import Vue from 'vue';

const AuthService = {
  auth: email => Vue.http.post('/api/v1/auth', { email }),
};

export default AuthService;
