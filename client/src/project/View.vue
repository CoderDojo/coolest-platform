<template>
  <div>
    <h1>View Project</h1>
    <h2>{{ project.name }}</h2>
  </div>
</template>

<script>
  import FetchProjectMixin from '@/project/FetchProjectMixin';

  export default {
    name: 'ViewProject',
    mixins: [FetchProjectMixin],
  };
</script>
