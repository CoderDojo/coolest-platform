import Vue from 'vue';

const UserService = {
  async create(email) {
    const res = await Vue.http.post('/api/v1/users', { email });
    if (res.body && res.body.auth) {
      const authToken = res.body.auth.token;
      localStorage.setItem('authToken', authToken);
      Vue.http.headers.common.Authorization = `Bearer ${authToken}`;
    }
    return res;
  },
};

export default UserService;
