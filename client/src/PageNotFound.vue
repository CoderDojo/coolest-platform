<template>
  <div class="center-grid">
    <div class="center-grid__content">
      <div class="text-center">
        <img class="logo" src="./assets/CoolestProjectsLogo.png" />
        <h1 class="not-found">
          404 <br> PAGE NOT FOUND
        </h1>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'PageNotFound',
  };
</script>

<style lang="scss">
  @import './assets/scss/main.scss';

  .logo {
    max-width: 180px;
    margin: 20px;
  }
</style>
