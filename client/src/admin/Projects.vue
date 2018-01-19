<template>
  <div class="container-fluid">
    <v-server-table v-if="event.id" :url="tableUrl" :columns="columns" :options="options">
      <span slot="category" slot-scope="props">{{ event.categories[props.row.category] }}</span>
      <a v-if="props.row.owner" slot="owner.email" slot-scope="props" :href="`mailto:${props.row.owner.email}`">{{ props.row.owner.email }}</a>
      <a v-if="props.row.supervisor" slot="supervisor.email" slot-scope="props" :href="`mailto:${props.row.supervisor.email}`">{{ props.row.supervisor.email }}</a>
    </v-server-table>
  </div>
</template>

<script>
  import EventService from '@/event/service';

  export default {
    name: 'AdminProjects',
    props: {
      eventSlug: {
        required: true,
        type: String,
      },
    },
    data() {
      return {
        event: {},
        columns: [
          'name',
          'category',
          'createdAt',
          'updatedAt',
          'owner.email',
          'supervisor.email',
        ],
      };
    },
    computed: {
      options() {
        return {
          filterByColumn: true,
          filterable: [
            'name',
            'category',
            'owner.email',
            'supervisor.email',
          ],
          perPage: 50,
          sortIcon: {
            base: 'fa',
            up: 'fa-sort-asc',
            down: 'fa-sort-desc',
            is: 'fa-sort',
          },
          headings: {
            name: 'Project Name',
            createdAt: 'Created At',
            updatedAt: 'Updated At',
            'owner.email': 'Owner Email',
            'supervisor.email': 'Supervisor Email',
          },
          highlightMatches: true,
          orderBy: {
            column: 'createdAt',
            ascending: false,
          },
          listColumns: {
            category: this.categoriesFilterOptions,
          },
        };
      },
      categoriesFilterOptions() {
        if (!this.event.categories) return {};
        return Object.keys(this.event.categories).map(key => ({
          id: key,
          text: this.event.categories[key],
        }));
      },
      tableUrl() {
        return this.event && this.event.id ? `/api/v1/events/${this.event.id}/projects` : '';
      },
    },
    methods: {
      async fetchEvent() {
        this.event = (await EventService.get(this.eventSlug)).body;
      },
    },
    created() {
      this.fetchEvent();
    },
  };
</script>

<style lang="scss">
  @import '~bootstrap/dist/css/bootstrap.min.css';
</style>
