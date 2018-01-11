import AdminAuthService from '@/admin/auth/service';

export default async function (to, from, next) {
  let isAuthorized = false;
  const authToken = localStorage.getItem('authToken');

  if (authToken) {
    isAuthorized = await AdminAuthService.checkToken(authToken);
  }
  next(isAuthorized ? true : { name: 'AdminLogin', replace: true, query: { redirect: to.path } });
}
