import Vue from 'vue';
import Router from 'vue-router';
import scrollBehavior from '@/router/scrollBehaviour';
import Auth from '@/event/Auth';
import AuthEmail from '@/auth/Email';
import ProjectList from '@/project/List';
import ViewProject from '@/project/View';
import CreateProject from '@/project/Create';
import ProjectExtraDetails from '@/project/ExtraDetails';
import CreateProjectCompleted from '@/project/CreateCompleted';
import EditProject from '@/project/Edit';

Vue.use(Router);

export default new Router({
  mode: 'history',
  scrollBehavior,
  routes: [
    {
      path: '/',
      redirect: '/events/cp-2018',
    },
    {
      path: '/auth-email',
      name: 'AuthEmail',
      component: AuthEmail,
    },
    {
      path: '/events/:eventId',
      name: 'Auth',
      component: Auth,
      props: true,
    },
    {
      path: '/events/:eventId/projects',
      name: 'ProjectList',
      component: ProjectList,
      props: true,
    },
    {
      path: '/events/:eventId/projects/create',
      name: 'CreateProject',
      component: CreateProject,
      props: true,
    },
    {
      path: '/events/:eventId/projects/:projectId/extra',
      name: 'ProjectExtraDetails',
      component: ProjectExtraDetails,
      props: true,
    },
    {
      path: '/events/:eventId/projects/:projectId/complete',
      name: 'CreateProjectCompleted',
      component: CreateProjectCompleted,
      props: true,
    },
    {
      path: '/events/:eventId/projects/:projectId',
      name: 'ViewProject',
      component: ViewProject,
      props: true,
    },
    {
      path: '/events/:eventId/projects/:projectId/edit',
      name: 'EditProject',
      component: EditProject,
      props: true,
    },
  ],
});
