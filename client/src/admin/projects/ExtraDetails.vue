<template>
  <div v-if="event.id && project.id">
    <div class="center-grid">
      <div class="center-grid__content">
        <div class="error-message-warning">
          You are an admin editing a live project
        </div>
        <extra-details :eventSlug='event.slug' :projectId='project.id' :_event='event' :_project='project'></extra-details>
      </div>
    </div>
  </div>
</template>;

<script>
  import FetchProjectMixin from '@/project/FetchProjectMixin';
  import ExtraDetails from '@/project/ExtraDetails';

  export default {
    name: 'AdminProjectsExtraDetails',
    mixins: [FetchProjectMixin],
    components: {
      ExtraDetails,
    },
  };
</script>
