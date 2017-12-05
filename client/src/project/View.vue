<template>
  <div>
    <h1>View Project</h1>
    <h2>{{ project.name }}</h2>
  </div>
</template>

<script>
  import ProjectService from '@/project/service';

  export default {
    name: 'ViewProject',
    props: {
      id: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        project: {},
      };
    },
    methods: {
      async fetchProject() {
        this.project = (await ProjectService.get(this.id)).body;
      },
    },
    created() {
      this.fetchProject();
    },
  };
</script>
