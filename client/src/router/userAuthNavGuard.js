import Vue from 'vue';
import AuthService from '@/auth/service';

export default async function (to, from, next) {
  let isAuthorized = false;
  const authToken = to.query.token || localStorage.getItem('authToken');

  if (authToken) {
    try {
      const authCheck = (await AuthService.authToken(authToken)).body;
      to.params.userId = authCheck.userId;
      isAuthorized = true;
      Vue.http.headers.common.Authorization = `Bearer ${authToken}`;
      localStorage.setItem('authToken', authToken);
    } catch (e) {
      isAuthorized = false;
    }
  }
  next(isAuthorized ? true : { name: 'Index', replace: true, query: { authFailed: true } });
}
