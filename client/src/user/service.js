import Vue from 'vue';

const UserService = {
  create: email => Vue.http.post('/api/v1/users', { email }),
};

export default UserService;
