import Vue from 'vue';

export default {
  get: id => Vue.http.get(`/api/v1/events/${id}`),
};
