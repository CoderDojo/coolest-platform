import Vue from 'vue';

const AdminEventsService = {
  sendConfirmAttendanceEmails: async eventId =>
    Vue.http.post(`/api/v1/admin/events/${eventId}/emails/confirmAttendance`),
};

export default AdminEventsService;
