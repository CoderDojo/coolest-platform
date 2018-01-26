import Vue from 'vue';

const AuthService = {
  authToken: token => Vue.http.post('/api/v1/auth/token', { token }),
};

export default AuthService;
