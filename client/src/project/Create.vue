<template>
  <div>
    <h2>Register for {{ event.name }}</h2>
    <project-form :event="event"></project-form>
  </div>
</template>

<script>
  import EventService from '@/event/service';
  import ProjectForm from '@/project/Form';

  export default {
    name: 'CreateProject',
    props: {
      eventId: {
        required: true,
        type: String,
      },
    },
    components: {
      ProjectForm,
    },
    data() {
      return {
        event: {},
      };
    },
    methods: {
      async fetchEvent() {
        this.event = (await EventService.get(this.eventId)).body;
      },
    },
    created() {
      this.fetchEvent();
    },
  };
</script>
