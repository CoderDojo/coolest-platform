<template>
  <div v-if="event">
    <h2>Register for {{ event.name }}</h2>
    <project-form :event="event" @projectFormSubmitted="onSubmit" :error="error"></project-form>
  </div>
</template>

<script>
  import ProjectService from '@/project/service';
  import ProjectForm from '@/project/Form';
  import FetchEventMixin from '@/event/FetchEventMixin';

  export default {
    name: 'CreateProject',
    mixins: [FetchEventMixin],
    components: {
      ProjectForm,
    },
    data() {
      return {
        submitted: false,
        error: null,
      };
    },
    methods: {
      async onSubmit(projectPayload) {
        try {
          const createdProject =
            (await ProjectService.create(this.event.id, projectPayload)).body;
          window.removeEventListener('beforeunload', this.onBeforeUnload);
          this.submitted = true;
          this.$ga.event({
            eventCategory: 'ProjectRegistration',
            eventAction: 'NewProject',
            eventLabel: this.event.id,
          });
          this.$router.push({
            name: this.event.questions && this.event.questions.length > 0 ? 'ProjectExtraDetails' : 'CreateProjectCompleted',
            params: {
              eventSlug: this.eventSlug,
              projectId: createdProject.id,
              _event: this.event,
              _project: createdProject,
            },
          });
        } catch (err) {
          this.error = err;
        }
      },
      onBeforeUnload(e) {
        e.returnValue = 'Are you sure you don\'t want to complete your registration application?';
        return 'Are you sure you don\'t want to complete your registration application?';
      },
    },
    created() {
      window.addEventListener('beforeunload', this.onBeforeUnload);
    },
    destroyed() {
      window.removeEventListener('beforeunload', this.onBeforeUnload);
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
