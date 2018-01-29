import Vue from 'vue';

export default {
  list: (eventId, userId) => Vue.http.get(`/api/v1/events/${eventId}/users/${userId}/projects`),
  get: (eventId, projectId) => Vue.http.get(`/api/v1/events/${eventId}/projects/${projectId}`),
  create: (eventId, project) => Vue.http.post(`/api/v1/events/${eventId}/projects`, project),
  update: (eventId, projectId, project) => Vue.http.put(`/api/v1/events/${eventId}/projects/${projectId}`, project),
  partialUpdate: (eventId, projectId, project) => Vue.http.patch(`/api/v1/events/${eventId}/projects/${projectId}`, project),
};
