// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import VueResource from 'vue-resource';
import VeeValidate from 'vee-validate';
import VueAnalytics from 'vue-analytics';
import 'vue-dob-picker/dist/static/vue-dob-picker.css';
import App from './App';
import router from './router';

Vue.config.productionTip = false;

Vue.use(VueResource);
Vue.use(VeeValidate);
Vue.use(VueAnalytics, {
  id: process.env.GOOGLE_ANALYTICS_PROPERTY_ID,
  router,
});

const authToken = localStorage.getItem('authToken');

if (authToken) {
  Vue.http.headers.common.Authorization = `Bearer ${authToken}`;
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App },
});
