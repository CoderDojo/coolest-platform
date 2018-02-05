<template>
  <div v-if="project.name && event.categories">
    <nav class="navbar navbar-branding">
      <router-link :to="{ name: 'Admin' }">Coolest Projects Admin</router-link>
    </nav>
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
        </tr>
        <tr>
          <td>{{ project.owner.firstName }}</td>
          <td>{{ project.owner.lastName }}</td>
          <td>{{ project.owner.email }}</td>
          <td>{{ project.owner.phone }}</td>
          <td>{{ project.owner.gender }}</td>
          <td>{{ project.owner.dob }}</td>
          <td>Owner</td>
        </tr>
        <tr>
          <td>{{ project.supervisor.firstName }}</td>
          <td>{{ project.supervisor.lastName }}</td>
          <td>{{ project.supervisor.email }}</td>
          <td>{{ project.supervisor.phone }}</td>
          <td>{{ project.supervisor.gender }}</td>
          <td>{{ project.supervisor.dob }}</td>
          <td>Supervisor</td>
        </tr>
        <tr v-for="member in project.members">
          <td>{{ member.firstName }}</td>
          <td>{{ member.lastName }}</td>
          <td>{{ member.email }}</td>
          <td>{{ member.phone }}</td>
          <td>{{ member.gender }}</td>
          <td>{{ member.dob }}</td>
          <td>Member</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
  import FetchProjectMixin from '@/project/FetchProjectMixin';

  export default {
    name: 'AdminProjectsView',
    mixins: [FetchProjectMixin],
  };
</script>
