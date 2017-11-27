<template>
  <div id="app">
    <b-navbar type="dark" variant="primary">
      <b-navbar-brand>Coolest Projects</b-navbar-brand>
    </b-navbar>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app',
};
</script>
