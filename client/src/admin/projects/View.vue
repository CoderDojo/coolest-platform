<template>
  <div v-if="project.name && event.categories">
    <nav class="navbar navbar-branding">
      <router-link :to="{ name: 'Admin' }">Coolest Projects Admin</router-link>
    </nav>
    <div class="alert alert-danger" role="alert" v-if="project.deletedAt">
      <p><strong>This project has been deleted (at {{ project.deletedAt }})</strong></p>
    </div>
    <div class="alert alert-warning" role="alert" v-if="error">
      <p><strong>There was an error modifying the project:</strong></p>
      <p>{{ error.message }}</p>
    </div>
    <div class="container-fluid">
      <h1>View Project</h1>
      <table class="table">
        <tr>
          <th>Name</th>
          <td>{{ project.name }}</td>
        </tr>
        <tr>
          <th>Category</th>
          <td>{{ event.categories[project.category] }}</td>
        </tr>
        <tr>
          <th>Description</th>
          <td>{{ project.description }}</td>
        </tr>
        <tr>
          <th>Created at</th>
          <td>{{ project.createdAt }}</td>
        </tr>
        <tr>
          <th>Updated at</th>
          <td>{{ project.updatedAt }}</td>
        </tr>
        <tr>
          <th>Organisation</th>
          <td>{{ project.org }}</td>
        </tr>
        <tr>
          <th>Organisation Reference</th>
          <td v-if="project.org === 'coderdojo'">
            <a :href="`https://zen.coderdojo.com/dojos/${project.orgRef}`">Link to Dojo</a>
          </td>
          <td v-else>{{ project.orgRef }}</td>
        </tr>
        <tr>
          <th>State/County</th>
          <td>{{ project.state }}</td>
        </tr>
        <tr>
          <th>City/Town</th>
          <td>{{ project.city }}</td>
        </tr>
      </table>
      <h2>Extra details</h2>
      <table class="table">
        <tr v-for="(value, key) in project.answers">
          <td>{{ key }}</td>
          <td>{{ value }}</td>
        </tr>
      </table>
      <h2>Users</h2>
      <table class="table">
        <tr>
          <th>First name</th>
          <th>Last name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Gender</th>
          <th>Date of birth</th>
          <th>User type</th>
          <th v-if="project.deletedAt">Deleted</th>
        </tr>
        <tr>
          <td>{{ project.owner.firstName }}</td>
          <td>{{ project.owner.lastName }}</td>
          <td>{{ project.owner.email }}</td>
          <td>{{ project.owner.phone }}</td>
          <td>{{ project.owner.gender }}</td>
          <td>{{ project.owner.dob }}</td>
          <td>Owner</td>
          <td v-if="project.deletedAt">n/a</td>
        </tr>
        <tr>
          <td>{{ project.supervisor.firstName }}</td>
          <td>{{ project.supervisor.lastName }}</td>
          <td>{{ project.supervisor.email }}</td>
          <td>{{ project.supervisor.phone }}</td>
          <td>{{ project.supervisor.gender }}</td>
          <td>{{ project.supervisor.dob }}</td>
          <td>Supervisor</td>
          <td class="text-danger" v-if="project.deletedAt">{{ project.supervisor.deletedAt }}</td>
        </tr>
        <tr v-for="member in project.members">
          <td>{{ member.firstName }}</td>
          <td>{{ member.lastName }}</td>
          <td>{{ member.email }}</td>
          <td>{{ member.phone }}</td>
          <td>{{ member.gender }}</td>
          <td>{{ member.dob }}</td>
          <td>Member</td>
          <td class="text-danger" v-if="project.deletedAt">{{ member.deletedAt }}</td>
        </tr>
      </table>
      <hr>
      <h2>Admin Actions</h2>
      <button class="btn btn-outline-danger" v-if="!project.deletedAt" v-on:click="confirmDeleteProject()">Delete Project</button>
      <p v-else>No actions available</p>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue';
  import moment from 'moment';
  import ProjectService from '@/project/service';
  import FetchProjectMixin from '@/project/FetchProjectMixin';

  export default {
    name: 'AdminProjectsView',
    mixins: [FetchProjectMixin],
    data() {
      return {
        error: null,
      };
    },
    methods: {
      confirmDeleteProject() {
        if (confirm('Do you want to delete this project and its associated users (except the owner)?')) { // eslint-disable-line no-alert
          this.deleteProject();
        }
      },
      async deleteProject() {
        try {
          const timestamp = moment().format();
          this.project.members.forEach((member, index) => Vue.set(member, 'deletedAt', timestamp));
          Vue.set(this.project.supervisor, 'deletedAt', timestamp);
          await ProjectService.update(this.event.id, this.projectId, {
            deletedAt: timestamp,
            users: this.project.members.concat(this.project.supervisor),
          });
          this.$router.go();
        } catch (err) {
          this.error = err;
        }
      },
    },
  };
</script>
