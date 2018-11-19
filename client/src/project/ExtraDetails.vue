<template>
  <form v-if="event && project" novalidate @submit.prevent="onSubmit">
    <div class="row">
      <div class="col">
        <h2>Extra details</h2>
      </div>
    </div>
    <div v-if="event.questions" >
      <div v-for="{ sentence, key } in usedQuestions" class="row row-v-center">
        <div class="col">
          <p v-html="sentence"></p>
        </div>
        <div>
          <select v-model="answers[key]">
            <option value="undefined" disabled></option>
            <option :value="true">Yes</option>
            <option :value="false">No</option>
          </select>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col text-center">
        <button type="submit" class="btn btn-primary">Finish registration</button>
      </div>
    </div>
  </form>
</template>

<script>
  import ProjectService from '@/project/service';
  import FetchProjectMixin from '@/project/FetchProjectMixin';
  import customQuestions from '@/project/CustomQuestions';

  export default {
    name: 'ExtraDetails',
    mixins: [FetchProjectMixin],
    data() {
      return {
        answers: {},
      };
    },
    computed: {
      usedQuestions() {
        return this.event.questions.reduce((acc, question) => {
          const customQuestion = customQuestions.find(q => q.key === question);
          if (customQuestion) {
            acc.push(customQuestion);
          }
          return acc;
        }, []);
      },
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
