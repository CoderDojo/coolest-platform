<template>
  <div class="row row-v-center text-center">
    <div class="col-6fr">
      <img class="logo" src="./assets/CoolestProjectsLogo.svg" />
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Header',
  };
</script>

<style lang="scss">
  .logo {
    max-width: 300px;
  }

  @media screen and (max-width: 768px) {
      .logo {
        max-width: 225px;
      }
    }
</style>
