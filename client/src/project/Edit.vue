<template>
  <div>
    <h2>Edit Project {{ project.name }}</h2>
    <project-form :event="eventId" :project="project"></project-form>
  </div>
</template>

<script>
  import EventService from '@/event/service';
  import ProjectService from '@/project/service';
  import ProjectForm from '@/project/Form';

  export default {
    name: 'EditProject',
    props: {
      eventSlug: {
        type: String,
        required: true,
      },
      projectId: {
        type: String,
        required: true,
      },
    },
    components: {
      ProjectForm,
    },
    data() {
      return {
        event: {},
        project: {},
      };
    },
    methods: {
      async fetchEvent() {
        this.event = (await EventService.get(this.eventSlug)).body;
      },
      async fetchProject() {
        this.project = (await ProjectService.get(this.event.id, this.projectId)).body;
      },
    },
    async created() {
      await this.fetchEvent();
      this.fetchProject();
    },
  };
</script>
