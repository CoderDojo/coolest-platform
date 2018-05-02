<template>
  <div>
    <navigation :eventSlug="eventSlug">
      <li class="nav-item"><span class="nav-link">Per page:</span></li>
      <li class="nav-item">
        <select v-model="itemsPerPage" class="form-control">
          <option>10</option>
          <option>25</option>
          <option>50</option>
        </select>
      </li>
      <li class="nav-item">
        <a :href="csvUrl" :download="`${eventSlug}-export.csv`" class="nav-link">Export CSV</a>
      </li>
      <li class="nav-item">
        <a v-show="confirmationEmailSendState === 'visible'" href="#" @click.prevent="sendConfirmAttendanceEmails" class="nav-link">Send Confirmation Emails</a>
        <a v-show="confirmationEmailSendState === 'sending'" class="nav-link"><i class="fa fa-spinner fa-pulse fa-fw"></i> Sending</a>
        <a v-show="confirmationEmailSendState === 'sent'" class="nav-link">Confirmation emails sent!</a>
      </li>
      <li class="nav-item">
        <button @click="generateSeating()" :disabled="event.seatingPrepared" :class="{'nav-link__btn--stroke' : event.seatingPrepared}" class="nav-link nav-link__btn"><i class="fa fa-map-o"></i> Generate seating</button>
      </li>
    </navigation>
    <div class="container-fluid">
      <v-server-table ref="projectListTable" v-if="event.id" :url="tableUrl" :columns="columns" :options="options">
        <span slot="category" slot-scope="props">{{ event.categories[props.row.category] }}</span>
        <span v-if="props.row.org" slot="org" slot-scope="props">
          <a v-if="props.row.org === 'coderdojo'" :href="`https://zen.coderdojo.com/dojos/${props.row.orgRef}`">CoderDojo</a>
          <span v-else>{{ props.row.org }}</span>
        </span>
        <a v-if="props.row.owner" slot="owner.email" slot-scope="props" :href="`mailto:${props.row.owner.email}`">{{ props.row.owner.email }}</a>
        <a v-if="props.row.supervisor" slot="supervisor.email" slot-scope="props" :href="`mailto:${props.row.supervisor.email}`">{{ props.row.supervisor.email }}</a>
        <router-link class="fa fa-eye" slot="view" slot-scope="props" :to="{ name: 'AdminProjectsView', params: { projectId: props.row.id, eventSlug, _project: props.row, _event: event } }"></router-link>
        <router-link class="fa fa-pencil" slot="edit" slot-scope="props" :to="{ name: 'AdminProjectsEdit', params: { eventSlug, projectId: props.row.id, _event: event, _project: props.row } }"></router-link>
      </v-server-table>
    </div>
  </div>
</template>

<script>
  import Navigation from '@/admin/Navigation';
  import FetchEventMixin from '@/event/FetchEventMixin';
  import AdminEventsService from '@/admin/events/service';
  import eventService from '@/event/service';

  export default {
    name: 'AdminProjects',
    mixins: [FetchEventMixin],
    components: {
      Navigation,
    },
    data() {
      return {
        columns: [
          'name',
          'category',
          'createdAt',
          'updatedAt',
          'org',
          'owner.email',
          'supervisor.email',
          'status',
          'view',
          'edit',
        ],
        tableState: {},
        itemsPerPage: 50,
        confirmationEmailSendState: 'visible',
      };
    },
    computed: {
      options() {
        return {
          filterByColumn: true,
          filterable: [
            'name',
            'category',
            'org',
            'status',
            'owner.email',
            'supervisor.email',
          ],
          sortable: [
            'name',
            'category',
            'createdAt',
            'updatedAt',
            'org',
            'owner.email',
            'status',
            'supervisor.email',
          ],
          perPage: this.itemsPerPage,
          perPageValues: [],
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
            org: 'Organisation',
            'owner.email': 'Owner Email',
            'supervisor.email': 'Supervisor Email',
            view: '',
            edit: '',
          },
          highlightMatches: true,
          orderBy: {
            column: 'createdAt',
            ascending: false,
          },
          listColumns: {
            category: this.categoriesFilterOptions,
            org: [
              {
                id: 'coderdojo',
                text: 'CoderDojo',
              },
              {
                id: 'codeclub',
                text: 'Code Club',
              },
              {
                id: 'raspberryjam',
                text: 'Raspberry Jam',
              },
              {
                id: 'pioneers',
                text: 'Pioneers',
              },
              {
                id: 'other',
                text: 'Other',
              },
            ],
            status: [
              {
                id: 'pending',
                text: 'Pending',
              },
              {
                id: 'canceled',
                text: 'Canceled',
              },
              {
                id: 'confirmed',
                text: 'Confirmed',
              },
            ],
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
    watch: {
      itemsPerPage(val) {
        this.$refs.projectListTable.setLimit(val);
      },
    },
    methods: {
      requestAdapter(data) {
        this.tableState = data;
        return data;
      },
      async sendConfirmAttendanceEmails() {
        let confirmString = 'Clicking OK will send emails to all pending projects.';
        if (this.event.lastConfirmationEmailDate) {
          confirmString += ` The last emails were sent on ${this.event.lastConfirmationEmailDate}`;
        }
        // eslint-disable-next-line no-alert
        if (confirm(confirmString)) {
          this.confirmationEmailSendState = 'sending';
          await AdminEventsService.sendConfirmAttendanceEmails(this.event.id);
          this.confirmationEmailSendState = 'sent';
        }
      },
      async generateSeating() {
        const message = 'This should only be done once. So make sure you have closed all applications before doing this as once the seating order is set it stays set!';
        if (confirm(message)) { // eslint-disable-line no-alert
          this.event = (await eventService.seats.post(this.event.id)).body;
        }
      },
    },
  };
</script>
<style lang="scss" scoped>
.nav-item{
  & .nav-link {
    &__btn{
      background-color: inherit;
      border: none;
      color: white;
      cursor: pointer;
      &--stroke {
        text-decoration: line-through; 
      }
    }
  }
}
</style>
