<template>
  <form v-if="event && project" novalidate @submit.prevent="onSubmit">
    <div class="row">
      <div class="col">
        <h2>Extra details</h2>
        <p>These questions are additional information about your project which we might use for some special judging on the day.</p>
      </div>
    </div>
    <div v-if="hasQuestion('travel_stipend')" class="row row-v-center">
      <div class="col">
        <p>For participants traveling from afar, a travel stipend may be available. Would you like to receive more information about applying for it?</p>
      </div>
      <div>
        <select v-model="answers.travel_stipend">
          <option value="undefined" disabled></option>
          <option :value="true">Yes</option>
          <option :value="false">No</option>
        </select>
      </div>
    </div>
    <div class="row">
      <div class="col text-center">
        <button type="submit" class="btn btn-primary">Finish Registration</button>
      </div>
    </div>
  </form>
</template>

<script>
  import ProjectService from '@/project/service';
  import FetchProjectMixin from '@/project/FetchProjectMixin';

  export default {
    name: 'ExtraDetails',
    mixins: [FetchProjectMixin],
    data() {
      return {
        answers: {},
      };
    },
    watch: {
      project() {
        this.answers = this.project.answers || {};
      },
    },
    methods: {
      async onSubmit() {
        await ProjectService.partialUpdate(this.event.id, this.projectId, {
          answers: this.answers,
        });
        this.$ga.event({
          eventCategory: 'ProjectRegistration',
          eventAction: 'ExtraDetailsProvided',
          eventLabel: this.event.id,
        });
        const isAdmin = this.$route.path.startsWith('/admin/');
        this.$router.push({
          name: isAdmin ? 'AdminProjects' : 'CreateProjectCompleted',
          params: {
            eventSlug: this.eventSlug,
            projectId: this.projectId,
            _event: this.event,
            _project: this.project,
          },
        });
      },
    },
  };
</script>
