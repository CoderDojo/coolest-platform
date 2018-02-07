// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import VueResource from 'vue-resource';
import VeeValidate from 'vee-validate';
import VueAnalytics from 'vue-analytics';
import { ServerTable } from 'vue-tables-2';
import 'vue-dob-picker/dist/static/vue-dob-picker.css';
import 'font-awesome/css/font-awesome.min.css';
import App from './App';
import router from './router';

Vue.config.productionTip = false;

Vue.use(VueResource);
Vue.use(VeeValidate);
Vue.use(VueAnalytics, {
  id: process.env.GOOGLE_ANALYTICS_PROPERTY_ID,
  router,
});
Vue.use(ServerTable, {}, false, 'bootstrap4');

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App },
});
