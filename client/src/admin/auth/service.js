import Vue from 'vue';

const AdminAuthService = {
  async checkToken(token) {
    try {
      await Vue.http.post('/api/v1/admin/auth/token', { token });
      return true;
    } catch (e) {
      return false;
    }
  },

  async login(email, password) {
    try {
      const res = await Vue.http.post('/api/v1/admin/auth', { email, password });
      const authToken = res.body.token;
      localStorage.setItem('authToken', authToken);
      Vue.http.headers.common.Authorization = `Bearer ${authToken}`;
      return true;
    } catch (e) {
      return false;
    }
  },
};

export default AdminAuthService;
