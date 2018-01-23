<template>
  <div>
    <div class="row justify-content-end">
      <div class="col-auto">
        <a :href="csvUrl" :download="`${eventSlug}-export.csv`" class="btn btn-outline-primary">Export CSV</a>
      </div>
    </div>
    <v-server-table v-if="event.id" :url="tableUrl" :columns="columns" :options="options">
      <span slot="category" slot-scope="props">{{ event.categories[props.row.category] }}</span>
      <a v-if="props.row.owner" slot="owner.email" slot-scope="props" :href="`mailto:${props.row.owner.email}`">{{ props.row.owner.email }}</a>
      <a v-if="props.row.supervisor" slot="supervisor.email" slot-scope="props" :href="`mailto:${props.row.supervisor.email}`">{{ props.row.supervisor.email }}</a>
      <router-link class="fa fa-eye" slot="view" slot-scope="props" :to="{ name: 'AdminProjectsView', params: { projectId: props.row.id, eventSlug, _project: props.row, _event: event } }"></router-link>
    </v-server-table>
  </div>
</template>

<script>
  import FetchEventMixin from '@/event/FetchEventMixin';

  export default {
    name: 'AdminProjects',
    mixins: [FetchEventMixin],
    data() {
      return {
        columns: [
          'name',
          'category',
          'createdAt',
          'updatedAt',
          'owner.email',
          'supervisor.email',
          'view',
        ],
        tableState: {},
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
          sortable: [
            'name',
            'category',
            'createdAt',
            'updatedAt',
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
            view: '',
          },
          highlightMatches: true,
          orderBy: {
            column: 'createdAt',
            ascending: false,
          },
          listColumns: {
            category: this.categoriesFilterOptions,
          },
          requestAdapter: this.requestAdapter,
        };
      },
      categoriesFilterOptions() {
        if (!this.event.categories) return [];
        return Object.keys(this.event.categories).map(key => ({
          id: key,
          text: this.event.categories[key],
        }));
      },
      tableUrl() {
        return this.event && this.event.id ? `/api/v1/events/${this.event.id}/projects` : '';
      },
      token() {
        return localStorage.getItem('authToken');
      },
      csvUrl() {
        if (!this.tableState.query) return '';
        let queryStr = '';
        Object.keys(this.tableState.query).forEach((key) => {
          const val = this.tableState.query[key];
          if (val) {
            queryStr += `&query[${encodeURIComponent(key)}]=${encodeURIComponent(val)}`;
          }
        });
        if (this.tableState.orderBy) {
          queryStr += `&orderBy=${encodeURIComponent(this.tableState.orderBy)}`;
        }
        if (this.tableState.ascending) {
          queryStr += `&ascending=${encodeURIComponent(this.tableState.ascending)}`;
        }
        if (this.tableState.byColumn) {
          queryStr += `&byColumn=${encodeURIComponent(this.tableState.byColumn)}`;
        }
        return `/api/v1/events/${this.event.id}/projects?format=csv&token=${this.token}${queryStr}`;
      },
    },
    methods: {
      requestAdapter(data) {
        this.tableState = data;
        return data;
      },
    },
  };
</script>
