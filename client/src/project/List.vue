<template>
  <div v-if="event.id">
    <h2>Register for {{ event.name }}</h2>
    <div class="row">
      <div class="col">
        <p v-if="projects.length > 0">You have already registered a project. Do you want to edit it or do you have another team you want to register?</p>
        <p v-else>You have not registered a project. Do you want to register one?</p>
      </div>
    </div>
    <div class="row row-no-margin" v-for="project in projects">
      <div class="col-1fr"></div>
      <div class="col-3fr">
        <router-link class="btn btn-primary full-width-block" :to="{ name: 'EditProject', params: { eventSlug: eventSlug, projectId: project.id, _event: event, _project: project } }">{{ project.name }}</router-link>
      </div>
      <div class="col-1fr"></div>
    </div>
    <div class="row row-no-margin">
      <div class="col-1fr"></div>
      <div class="col-3fr">
        <router-link class="btn btn-primary-outline full-width-block" :to="{ name: 'CreateProject', params: { _event: event, eventSlug } }">Create new project</router-link>
      </div>
      <div class="col-1fr"></div>
    </div>
  </div>
</template>

<script>
  import ProjectService from '@/project/service';
  import FetchEventMixin from '@/event/FetchEventMixin';

  export default {
    name: 'ProjectList',
    mixins: [FetchEventMixin],
    props: {
      userId: {
        required: true,
        type: String,
      },
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
    watch: {
      event() {
        if (this.projects.length === 0 && this.event.id) {
          this.fetchProjects();
        }
      },
    },
    methods: {
      async fetchProjects() {
        this.projects = (await ProjectService.list(this.event.id, this.userId)).body.data;
      },
    },
    created() {
      if (this.event.id) {
        this.fetchProjects();
      }
    },
  };
</script>
