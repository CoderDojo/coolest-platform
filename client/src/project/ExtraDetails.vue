<template>
  <form v-if="event && project" novalidate @submit.prevent="onSubmit">
    <div class="row">
      <div class="col">
        <h2>Extra details</h2>
        <p>These questions are additional information about your project which we might use for some special judging on the day.</p>
      </div>
    </div>
    <div v-if="hasQuestion('social_project')" class="row row-v-center">
      <div class="col">
        <p>Do you think your project tries to tackle a social problem?</p>
      </div>
      <div>
        <select v-model="answers.social_project">
          <option value="undefined" disabled></option>
          <option :value="true">Yes</option>
          <option :value="false">No</option>
        </select>
      </div>
    </div>
    <div v-if="hasQuestion('educational_project')" class="row row-v-center">
      <div class="col">
        <p>Do you think your project topic is around Education?</p>
      </div>
      <div>
        <select v-model="answers.educational_project">
          <option value="undefined" disabled></option>
          <option :value="true">Yes</option>
          <option :value="false">No</option>
        </select>
      </div>
    </div>
    <div v-if="hasQuestion('innovator_stage')">
      <div class="row">
        <div class="col">
          <h2>Innovator Stage</h2>
          <p>The Openet Innovator Stage provides an opportunity for young people participating in Coolest Projects to get on the stage in the Main Hall to pitch and be interviewed about their projects and ideas./nParticipants do not have to present a business plan! The idea behind the Openet Innovator Stage is to give participants the opportunity to further enhance their presentation skills which are vital for the future innovators of the world.</p>
        </div>
      </div>
      <div class="row row-v-center">
        <div class="col">
          <p>Would you or your team want to present your project on the Innovator Stage? (This does not guarantee a place as spaces are limited on the day)</p>
        </div>
        <div>
          <select v-model="answers.innovator_stage">
            <option value="undefined" disabled></option>
            <option :value="true">Yes</option>
            <option :value="false">No</option>
          </select>
        </div>
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
      hasQuestion(q) {
        return this.event.questions && this.event.questions.indexOf(q) >= 0;
      },
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
