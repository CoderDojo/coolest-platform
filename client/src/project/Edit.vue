<template>
  <div v-if="event.id && project.id">
    <h2>Edit Project {{ project.name }}</h2>
    <project-form :event="event" :project="project"></project-form>
  </div>
</template>

<script>
  import FetchProjectMixin from '@/project/FetchProjectMixin';
  import ProjectForm from '@/project/Form';

  export default {
    name: 'EditProject',
    mixins: [FetchProjectMixin],
    components: {
      ProjectForm,
    },
  };
</script>
