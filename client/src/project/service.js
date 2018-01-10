import Vue from 'vue';

export default {
  list: eventId => Vue.http.get(`/api/v1/events/${eventId}/projects`),
  get: (eventId, projectId) => Vue.http.get(`/api/v1/events/${eventId}/projects/${projectId}`),
  create: (eventId, project) => Vue.http.post(`/api/v1/events/${eventId}/projects`, project),
  update: (eventId, projectId, project) => Vue.http.patch(`/api/v1/events/${eventId}/projects/${projectId}`, project),
};
