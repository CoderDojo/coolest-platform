<template>
  <nav class="navbar navbar-branding">
    <router-link :to="{ name: 'Admin' }">Coolest Projects Admin</router-link>
    <ul class="nav justify-content-end">
      <slot></slot>
    </ul>
  </nav>
</template>

<script>

  export default {
    name: 'AdminNavigation',
    props: {
      eventSlug: {
        required: true,
        type: String,
      },
    },
  };
</script>
