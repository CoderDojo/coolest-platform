<template>
  <router-view></router-view>
</template>

<script>
  export default {
    name: 'Admin',
  };
</script>

<style lang="scss">
  @import '../assets/scss/_colors.scss';
  @import '../assets/scss/main.scss';
  @import '~bootstrap/dist/css/bootstrap.min.css';

  .navbar-branding {
    background: $coolest-red;
    margin-bottom: 15px;

    a {
      color: $coolest-white;
    }
  }
</style>
