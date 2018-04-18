<template>
  <div class="center-grid">
    <div class="center-grid__content">
      <div class="text-center">
        <Header />
        <div class="not-found">
          <h1>
            It looks like you tried to go to a page that does not exist!
          </h1>
          <h1>
            <router-link to="/">Please go to our homepage and try again</router-link>
          </h1>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Header from '@/Header';

  export default {
    name: 'PageNotFound',
    components: {
      Header,
    },
  };
</script>

<style lang="scss">
  @import './assets/scss/main.scss';

  .not-found {
    h1 {
      padding: 10px;
    }
  }
</style>
