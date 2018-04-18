<template>
<div v-if="event.id && project.id">
  <div class="center-grid">
    <div class="center-grid__content">
      <div class="text-center">
        <img src="/static/img/CoolestProjectsLogo.ab863b6.png" class="logo">
      </div>
      <div class="error-message-warning">
        You are an admin editing a live project
      </div>
      <h2>Edit Project "{{ project.name }}"</h2>
      <project-form :event="event" :project="project"></project-form>
    </div>
  </div>
</div>
</template>;

<script>
  import FetchProjectMixin from '@/project/FetchProjectMixin';
  import ProjectForm from '@/project/Form';

  export default {
    name: 'AdminProjectsEdit',
    mixins: [FetchProjectMixin],
    components: {
      ProjectForm,
    },
  };
</script>

