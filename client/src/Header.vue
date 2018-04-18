<template>
  <div class="row row-v-center text-center">
    <div class="col-2fr">
      <img class="logo-small logo-cc" src="./assets/CodeClubLogo.svg" />
    </div>
    <div class="col-2fr">
      <img class="logo" src="./assets/CoolestProjectsLogo.png" />
    </div>
    <div class="col-2fr">
      <img class="logo-small" src="./assets/RaspberryPiLogo.png" />
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
    max-width: 180px;
    margin: 20px;
    &-small {
      max-width: 80px;
    }
    &-cc {
      height: 80px;
    }
    @media screen and (max-width: 768px) {
      max-width: 120px;
      &-small {
        max-width: 60px;
      }
    }
  }
</style>
