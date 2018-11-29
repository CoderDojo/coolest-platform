import Vue from 'vue';

const UserService = {
  async create(email, eventSlug) {
    const res = await Vue.http.post('/api/v1/users', { email, eventSlug });
    if (res.body && res.body.auth) {
      const authToken = res.body.auth.token;
      localStorage.setItem('authToken', authToken);
      Vue.http.headers.common.Authorization = `Bearer ${authToken}`;
    }
    return res;
  },
  createAdmin({ email, password }) {
    return Vue.http.post('/api/v1/admin/users', { email, password });
  },

};

export default UserService;
