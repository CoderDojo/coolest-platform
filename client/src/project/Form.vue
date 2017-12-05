<template>
  <form @submit.prevent="onSubmit">
    <div class="row">
      <div class="col">
        <label>Project Name</label>
        <input v-model="projectDetails.name" class="full-width-block" />
      </div>
    </div>
    <div class="row">
      <div class="col">
        <label>Project Description</label>
        <textarea v-model="projectDetails.description" class="full-width-block" rows="4"></textarea>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <label>Project Category</label>
        <select v-model="projectDetails.category" class="full-width-block">
          <option v-for="category in event.categories" :value="category">{{ category }}</option>
        </select>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <label>Is this Project from a CoderDojo Dojo?</label>
        <div class="row row-no-margin">
          <div class="col-2fr">
            <select v-model="projectDetails.fromDojo" class="full-width-block">
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div v-show="projectDetails.fromDojo === 'true'" class="col-3fr">
            <select v-model="projectDetails.dojoId" class="full-width-block">
              <option v-for="dojo in dojos" :value="dojo.id">{{ dojo.name }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    <hr />
    <div class="row">
      <div class="col">
        <label>How many students worked on the project?</label>
        <div class="row row-no-margin">
          <div class="col-2fr">
            <select v-model="numParticipants" class="full-width-block">
              <option v-for="n in 6" :value="n">{{ n }}</option>
            </select>
          </div>
          <div class="col-3fr"></div>
        </div>
      </div>
    </div>
    <div v-for="n in participants.length">
      <div class="row">
        <div class="col">
          <div class="row row-no-margin">
            <div class="col-1fr">
              <label>First name</label>
              <input type="text" v-model="participants[n - 1].firstName" class="full-width-block" />
            </div>
            <div class="col-1fr">
              <label>Surname</label>
              <input type="text" v-model="participants[n - 1].lastName" class="full-width-block" />
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <label v-show="!participants[n - 1].name">DOB</label>
          <label v-show="participants[n - 1].name">DOB of "{{ participants[n - 1].name }}"</label>
          <vue-dob-picker class="full-width-block" v-model="participants[n - 1].dob" show-labels="false" :placeholders="['Date', 'Month', 'Year']"></vue-dob-picker>
        </div>
      </div>
      <div class="row">
        <div class="col-1fr">
          <label>Any special requirements</label>
          <select v-model="participants[n - 1].specialRequirementsProvided" class="full-width-block">
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          <textarea v-show="participants[n - 1].specialRequirementsProvided === 'true'" class="full-width-block" v-model="participants[n - 1].specialRequirements" rows="5"></textarea>
        </div>
        <div class="col-1fr">
          <label>Gender</label>
          <select v-model="participants[n - 1].gender" class="full-width-block">
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="undisclosed">Rather not say</option>
          </select>
        </div>
      </div>
    </div>
    <hr />
    <div class="row">
      <div class="col">
        <p>We require each project to have 1 nominated adult supervisor. Contact us directly if you want to change this after submitting this form.</p>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <div class="row row-no-margin">
          <div class="col">
            <label>First Name of Guardian</label>
            <input type="text" v-model="supervisor.firstName" class="full-width-block" />
          </div>
          <div class="col">
            <label>Surname of Guardian</label>
            <input type="text" v-model="supervisor.lastName" class="full-width-block" />
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <label>Email of Adult Supervisor</label>
        <input type="email" v-model="supervisor.email" class="full-width-block" />
      </div>
    </div>
    <div class="row">
      <div class="col">
        <label>Phone Number of Adult Supervisor</label>
        <input type="text" v-model="supervisor.phone" class="full-width-block" />
      </div>
    </div>
    <div class="row">
      <div class="col text-center">
        <button type="submit" class="btn btn-primary">Finish Registration</button>
      </div>
    </div>
  </form>
</template>

<script>
  import Vue from 'vue';
  import VueDobPicker from 'vue-dob-picker';
  import { clone, pick } from 'lodash';
  import ProjectService from '@/project/service';

  export default {
    name: 'ProjectForm',
    props: {
      event: {
        required: true,
        type: Object,
      },
      project: {
        type: Object,
      },
    },
    components: {
      VueDobPicker,
    },
    data() {
      return {
        dojos: [],
        numParticipants: 1,
        projectDetails: {},
        participants: [{}],
        supervisor: {},
      };
    },
    computed: {
      projectPayload: {
        get() {
          const project = {
            id: this.projectDetails.id,
            name: this.projectDetails.name,
            description: this.projectDetails.description,
            category: this.projectDetails.category,
            dojoId: this.projectDetails.dojoId,
          };
          project.users = this.participants.map((participant) => {
            const _participant = pick(participant, [
              'firstName',
              'lastName',
              'dob',
              'specialRequirements',
              'gender',
            ]);
            _participant.type = 'member';
            return _participant;
          });
          project.users = [
            ...project.users,
            {
              firstName: this.supervisor.firstName,
              lastName: this.supervisor.lastName,
              email: this.supervisor.email,
              phone: this.supervisor.phone,
              type: 'supervisor',
            },
          ];

          return project;
        },
        set(project) {
          this.projectDetails = pick(project, [
            'id', 'name', 'description', 'category', 'dojoId',
          ]);
          this.participants = project.users.filter(user => user.type === 'member').map((user) => {
            const _user = clone(user);
            _user.specialRequirementsProvided = !!user.specialRequirements;
            delete _user.type;
            return _user;
          });
          this.numParticipants = this.participants.length;
          this.supervisor = clone(project.users.find(user => user.type === 'supervisor'));
          delete this.supervisor.type;
        },
      },
    },
    watch: {
      numParticipants(newLength, oldLength) {
        if (newLength > oldLength) {
          for (let i = 0; i < newLength - oldLength; i += 1) {
            this.participants.push({});
          }
        } else if (newLength < oldLength) {
          this.participants.splice(newLength, oldLength - newLength);
        }
      },
    },
    methods: {
      async fetchDojos() {
        this.dojos = (await Vue.http.post('https://zen.coderdojo.com/api/2.0/dojos', {
          query: {
            verified: 1,
            deleted: 0,
            fields$: ['id', 'name'],
            sort$: {
              name: 1,
            },
          },
        })).body;
      },
      async onSubmit() {
        await ProjectService.create(this.event.id, this.projectPayload);
        this.$router.push({
          name: 'CreateProjectCompleted',
          params: { eventId: this.event.id },
        });
      },
    },
    created() {
      this.fetchDojos();
    },
  };
</script>
