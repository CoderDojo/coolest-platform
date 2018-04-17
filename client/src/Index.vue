<template>
  <div class="center-grid">
    <div class="center-grid__content">
      <Header />
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
  import Header from '@/Header';

  export default {
    name: 'Index',
    computed: {
      isIE() {
        return window.navigator.userAgent.indexOf('Trident') >= 0;
      },
    },
    components: {
      Header,
    },
  };
</script>

<style lang="scss">
  @import './assets/scss/main.scss';
  .logo-cc {
    height: 80px;
  }
</style>
