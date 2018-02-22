<template>
  <div>
    <navigation :eventSlug="eventSlug"></navigation>
    <div class="container-fluid">
      <h1>Stats!</h1>
      <table class="table">
        <tr>
          <th>Number of projects</th>
          <td>{{ projects.length }}</td>
        </tr>
        <tr>
          <th>Supervisors</th>
          <td>{{ supervisors.length }}</td>
        </tr>
        <tr>
          <th>Participants</th>
          <td>{{ members.length }}</td>
        </tr>
        <tr>
          <th>Male participants</th>
          <td>{{ membersMale.length }} ({{ membersMalePercentage }}%)</td>
        </tr>
        <tr>
          <th>Female participants</th>
          <td>{{ membersFemale.length }} ({{ membersFemalePercentage }}%)</td>
        </tr>
        <tr>
          <th>Undiscosed gender participants</th>
          <td>{{ membersUndisclosed.length }} ({{ membersUndisclosedPercentage }}%)</td>
        </tr>
        <tr>
          <th>CoderDojo Projects</th>
          <td>{{ coderDojoProjects.length }} ({{ coderDojoProjectsPercentage }}%)</td>
        </tr>
        <tr>
          <th>Code Club Projects</th>
          <td>{{ codeClubProjects.length }} ({{ codeClubProjectsPercentage }}%)</td>
        </tr>
        <tr>
          <th>Raspberry Jam Projects</th>
          <td>{{ raspberryJamProjects.length }} ({{ raspberryJamProjectsPercentage }}%)</td>
        </tr>
        <tr>
          <th>Pioneers Projects</th>
          <td>{{ pioneersProjects.length }} ({{ pioneersProjectsPercentage }}%)</td>
        </tr>
        <tr>
          <th>Other Projects</th>
          <td>{{ otherProjects.length }} ({{ otherProjectsPercentage }}%)</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue';
  import { uniqWith } from 'lodash';
  import Navigation from '@/admin/Navigation';
  import FetchEventMixin from '@/event/FetchEventMixin';

  export default {
    name: 'AdminProjectStats',
    mixins: [FetchEventMixin],
    components: {
      Navigation,
    },
    data() {
      return {
        users: [],
        projects: [],
      };
    },
    computed: {
      members() {
        return this.users.filter(user => user.membership[0].type === 'member');
      },
      membersMale() {
        return this.members.filter(user => user.gender === 'male');
      },
      membersMalePercentage() {
        return Math.round((this.membersMale.length / this.members.length) * 100);
      },
      membersFemale() {
        return this.members.filter(user => user.gender === 'female');
      },
      membersFemalePercentage() {
        return Math.round((this.membersFemale.length / this.members.length) * 100);
      },
      membersUndisclosed() {
        return this.members.filter(user => user.gender === 'undisclosed');
      },
      membersUndisclosedPercentage() {
        return Math.round((this.membersUndisclosed.length / this.members.length) * 100);
      },
      supervisors() {
        return uniqWith(
          this.users.filter(user => user.membership[0].type === 'supervisor'),
          (user1, user2) => user1.email === user2.email,
        );
      },
      coderDojoProjects() {
        return this.projects.filter(project => project.org === 'coderdojo');
      },
      coderDojoProjectsPercentage() {
        return Math.round((this.coderDojoProjects.length / this.projects.length) * 100);
      },
      codeClubProjects() {
        return this.projects.filter(project => project.org === 'codeclub');
      },
      codeClubProjectsPercentage() {
        return Math.round((this.codeClubProjects.length / this.projects.length) * 100);
      },
      raspberryJamProjects() {
        return this.projects.filter(project => project.org === 'raspberryjam');
      },
      raspberryJamProjectsPercentage() {
        return Math.round((this.raspberryJamProjects.length / this.projects.length) * 100);
      },
      pioneersProjects() {
        return this.projects.filter(project => project.org === 'pioneers');
      },
      pioneersProjectsPercentage() {
        return Math.round((this.pioneersProjects.length / this.projects.length) * 100);
      },
      otherProjects() {
        return this.projects.filter(project => project.org === 'other');
      },
      otherProjectsPercentage() {
        return Math.round((this.otherProjects.length / this.projects.length) * 100);
      },
    },
    watch: {
      event() {
        this.fetchProjects();
      },
    },
    methods: {
      async fetchUsers() {
        this.users = (await Vue.http.get('/api/v1/users')).body.data;
      },
      async fetchProjects() {
        if (this.event.id) {
          this.projects = (await Vue.http.get(`/api/v1/events/${this.event.id}/projects`)).body.data;
        }
      },
    },
    created() {
      this.fetchUsers();
      this.fetchProjects();
    },
  };
</script>
