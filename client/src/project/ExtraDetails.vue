<template>
  <form novalidate @submit.prevent="onSubmit">
    <div class="row">
      <div class="col">
        <h2>Extra Details</h2>
        <p>These questions are additional information about your project which we might use for some special judging on the day.</p>
      </div>
    </div>
    <div v-if="hasQuestion('social_project')" class="row row-v-center">
      <div class="col">
        <p>Do you think your project trys to tackle a social problem?</p>
      </div>
      <div>
        <select v-model="questions.social_project">
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
        <select v-model="questions.educational_project">
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
          <select v-model="questions.innovator_stage">
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
  import EventService from '@/event/service';
  import ProjectService from '@/project/service';

  export default {
    name: 'ExtraDetails',
    props: {
      eventId: {
        type: String,
        required: true,
      },
      projectId: {
        type: String,
        required: true,
      },
      _event: {
        type: Object,
      },
      _project: {
        type: Object,
      },
    },
    data() {
      return {
        project: {},
        event: {},
        questions: {},
      };
    },
    methods: {
      async fetchEvent() {
        this.event = (await EventService.get(this.eventId)).body;
      },
      async fetchProject() {
        this.project = (await ProjectService.get(this.eventId, this.projectId)).body;
      },
      hasQuestion(q) {
        return this.event.questions && this.event.questions.indexOf(q) >= 0;
      },
      async onSubmit() {
        await ProjectService.update(this.eventId, this.projectId, {
          questions: this.questions,
        });
        this.$ga.event({
          eventCategory: 'ProjectRegistration',
          eventAction: 'ExtraDetailsProvided',
          eventLabel: this.eventId,
        });
        this.$router.push({
          name: 'CreateProjectCompleted',
          params: {
            eventId: this.eventId,
            projectId: this.projectId,
            _event: this.event,
            _project: this.project,
          },
        });
      },
    },
    created() {
      if (this._event) {
        this.event = this._event;
      } else {
        this.fetchEvent();
      }
      if (this._project) {
        this.project = this._project;
      } else {
        this.fetchProject();
      }
    },
  };
</script>
