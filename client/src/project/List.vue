<template>
  <div>
    <h1>Project List</h1>
    <ul>
      <li v-for="project in projects">
        {{ project.name }}
        <router-link :to="{ name: 'ViewProject', params: { eventSlug: eventSlug, projectId: project.id } }">[View]</router-link>
        <router-link :to="{ name: 'EditProject', params: { eventSlug: eventSlug, projectId: project.id } }">[Edit]</router-link>
      </li>
    </ul>
  </div>
</template>

<script>
  import ProjectService from '@/project/service';

  export default {
    name: 'ProjectList',
    props: {
      eventSlug: {
        required: true,
        type: String,
      },
    },
    data() {
      return {
        projects: [],
      };
    },
    methods: {
      async fetchProjects() {
        this.projects = (await ProjectService.list(this.eventSlug)).body;
      },
    },
    created() {
      this.fetchProjects();
    },
  };
</script>
