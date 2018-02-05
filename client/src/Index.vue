<template>
  <div class="center-grid">
    <div class="center-grid__content">
      <div class="text-center">
        <img class="logo" src="./assets/CoolestProjectsLogo.png" />
      </div>
      <div v-if="isIE">
        <h2>Sorry, Internet Explorer is not supported</h2>
        <div class="row">
          <p class="col">The browser you are using can not be used to complete this form. Please try again in any modern browser (<a href="https://www.google.com/chrome/">Chrome</a>, <a href="https://www.microsoft.com/en-ie/windows/microsoft-edge">Edge</a>, <a href="https://www.mozilla.org/en-GB/firefox/">Firefox</a>, etc.) to complete this form.</p>
        </div>
      </div>
      <router-view v-else></router-view>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Index',
    computed: {
      isIE() {
        return window.navigator.userAgent.indexOf('Trident') >= 0;
      },
    },
  };
</script>

<style lang="scss">
  @import './assets/scss/main.scss';

  .logo {
    max-width: 180px;
    margin: 20px;
  }
</style>
