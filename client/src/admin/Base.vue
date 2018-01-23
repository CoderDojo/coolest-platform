<template>
  <div>
    <nav class="navbar navbar-branding">
      <router-link :to="{ name: 'Admin' }">Coolest Projects Admin</router-link>
    </nav>
    <div class="container-fluid">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Admin',
  };
</script>

<style lang="scss">
  @import '../assets/scss/_colors.scss';
  @import '~bootstrap/dist/css/bootstrap.min.css';

  .navbar-branding {
    background: $coolest-red;
    margin-bottom: 15px;

    a {
      color: $coolest-white;
    }
  }
</style>
