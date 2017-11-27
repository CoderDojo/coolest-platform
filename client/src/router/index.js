import Vue from 'vue';
import Router from 'vue-router';
import Auth from '@/auth/Auth';
import ProjectList from '@/project/List';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Auth',
      component: Auth,
    },
    {
      path: '/projects',
      name: 'ProjectList',
      component: ProjectList,
    },
  ],
});
