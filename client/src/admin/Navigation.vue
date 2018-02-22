<template>
  <nav class="navbar navbar-branding">
    <router-link :to="{ name: 'Admin' }">Coolest Projects Admin</router-link>
    <ul class="nav justify-content-end">
      <slot></slot>
      <li class="nav-item">
        <router-link :to="{ name: 'AdminProjects', params: { eventSlug } }" class="nav-link">Projects List</router-link>
      </li>
      <li class="nav-item">
        <router-link :to="{ name: 'AdminProjectsStats', params: { eventSlug } }" class="nav-link">Stats</router-link>
      </li>
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
