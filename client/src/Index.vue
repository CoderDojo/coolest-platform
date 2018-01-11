<template>
  <div class="center-grid">
    <div class="center-grid__content">
      <div class="text-center">
        <img class="logo" src="./assets/CoolestProjectsLogo.png" />
      </div>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Index',
  };
</script>

<style scoped>
  .logo {
    max-width: 180px;
    margin: 20px;
  }
</style>
