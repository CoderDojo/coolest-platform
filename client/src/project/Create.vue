<template>
  <div>
    <h2>Register for {{ event.name }}</h2>
    <project-form :event="event" @projectFormSubmitted="onSubmit"></project-form>
  </div>
</template>

<script>
  import EventService from '@/event/service';
  import ProjectService from '@/project/service';
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
        project: {},
        event: {},
        submitted: false,
      };
    },
    methods: {
      async fetchEvent() {
        this.event = (await EventService.get(this.eventId)).body;
      },
      async onSubmit(projectPayload) {
        window.removeEventListener('beforeunload', this.onBeforeUnload);
        this.submitted = true;
        const createdProject =
          (await ProjectService.create(this.eventId, projectPayload)).body;
        this.$ga.event({
          eventCategory: 'ProjectRegistration',
          eventAction: 'NewProject',
          eventLabel: this.eventId,
        });
        this.$router.push({
          name: this.event.questions && this.event.questions.length > 0 ? 'ProjectExtraDetails' : 'CreateProjectCompleted',
          params: {
            eventId: this.eventId,
            projectId: createdProject.id,
            _event: this.event,
            _project: createdProject,
          },
        });
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
