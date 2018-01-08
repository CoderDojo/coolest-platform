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
    name: 'app',
  };
</script>

<style lang="scss">
  @import './assets/scss/main.scss';

  .logo {
    max-width: 180px;
    margin: 20px;
  }
</style>
