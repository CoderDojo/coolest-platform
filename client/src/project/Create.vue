<template>
  <div>
    <h2>Register for {{ event.name }}</h2>
    <project-form :event="event" @submit="onSubmit"></project-form>
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
        submitted: false,
      };
    },
    methods: {
      async fetchEvent() {
        this.event = (await EventService.get(this.eventId)).body;
      },
      onSubmit() {
        window.removeEventListener('beforeunload', this.onBeforeUnload);
        this.submitted = true;
      },
      onBeforeUnload(e) {
        e.returnValue = 'Are you sure you don\'t want to complete your registration application?';
        return 'Are you sure you don\'t want to complete your registration application?';
      },
    },
    created() {
      window.addEventListener('beforeunload', this.onBeforeUnload);
      this.fetchEvent();
    },
    beforeRouteLeave(to, from, next) {
      if (this.submitted) {
        next();
      } else {
        // eslint-disable-next-line
        next(confirm('Are you sure you don\'t want to complete your registration application?'));
      }
    },
  };
</script>
