<template>
  <div>
    <nav class="navbar navbar-branding">
      <span>Coolest Projects Admin</span>
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

<style lang="scss" scoped>
  .navbar-branding {
    color: #fff;
    background: #E73359;
    margin-bottom: 15px;
  }
</style>
