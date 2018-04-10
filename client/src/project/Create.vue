<template>
  <div v-if="event">
    <h2>Register for {{ event.name }}</h2>
    <div v-if="isOpen">
      <project-form :event="event"></project-form>
    </div>
    <div v-else>
      <p> The registration for {{event.name}} has now closed. Please contact {{event.contact}} if you have any questions. </p>
    </div>
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
