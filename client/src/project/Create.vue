<template>
  <div v-if="event">
    <h2>Register for {{ event.name }}</h2>
    <project-form :event="event"></project-form>
  </div>
</template>

<script>
  import ProjectForm from '@/project/Form';
  import FetchEventMixin from '@/event/FetchEventMixin';

  export default {
    name: 'CreateProject',
    mixins: [FetchEventMixin],
    components: {
      ProjectForm,
    },
  };
</script>
