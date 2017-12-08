<template>
  <form novalidate @submit.prevent="onSubmit">
    <div class="row">
      <div class="col">
        <label>Project Name</label>
        <input v-model="projectDetails.name" v-validate="{ required: true }" data-vv-name="projectName" class="full-width-block" />
        <span class="error-message" v-show="errors.has('projectName:required')">* A project name is required</span>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <label>Project Description</label>
        <textarea v-model="projectDetails.description" v-validate="{ required: true }" data-vv-name="projectDescription" class="full-width-block" rows="4"></textarea>
        <span class="error-message" v-show="errors.has('projectDescription:required')">* A project description is required</span>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <label>Project Category</label>
        <select v-model="projectDetails.category" v-validate="{ required: true }" data-vv-name="projectCategory" class="full-width-block" :class="{ placeholder: projectDetails.category === undefined }">
          <option :value="undefined" disabled>Please select a category</option>
          <option v-for="category in event.categories" :value="category">{{ category }}</option>
        </select>
        <span class="error-message" v-show="errors.has('projectCategory:required')">* A project category is required</span>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <label>Is this Project from a CoderDojo Dojo?</label>
        <div class="row row-no-margin">
          <div class="col-2fr">
            <select v-model="projectDetails.fromDojo" v-validate="{ required: true }" data-vv-name="fromDojo" class="full-width-block">
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
            <span class="error-message" v-show="errors.has('fromDojo:required')">* You must select whether the project is from a Dojo</span>
          </div>
          <div v-show="projectDetails.fromDojo === 'true'" class="col-3fr">
            <model-list-select v-model="projectDetails.dojoId" v-validate="projectDetails.fromDojo === 'true' ? 'required' : ''" data-vv-name="dojoId" class="full-width-block" :class="{ placeholder: projectDetails.category === undefined }" :list="dojos" placeholder="Please select a Dojo" option-value="id" option-text="name"></model-list-select>
          </div>
        </div>
        <span class="error-message" v-show="errors.has('dojoId:required')">* If you attend a Dojo, you must select which Dojo</span>
      </div>
    </div>
    <hr />
    <div class="row">
      <div class="col">
        <label>How many particpants are in this project?</label>
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
              <input type="text" placeholder="e.g. Emily" v-model="participants[n - 1].firstName" v-validate="{ required: true }" :data-vv-name="`participant-${n}-firstName`" class="full-width-block" />
              <span class="error-message" v-show="errors.has(`participant-${n}-firstName:required`)">* Participant's first name is required</span>
            </div>
            <div class="col-1fr">
              <label>Surname</label>
              <input type="text" placeholder="e.g. Smith" v-model="participants[n - 1].lastName" v-validate="{ required: true }" :data-vv-name="`participant-${n}-lastName`" class="full-width-block" />
              <span class="error-message" v-show="errors.has(`participant-${n}-lastName:required`)">* Participant's surname is required</span>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <label v-show="!participants[n - 1].name">Date of Birth</label>
          <label v-show="participants[n - 1].name">Date of Birth of "{{ participants[n - 1].name }}"</label>
          <vue-dob-picker class="full-width-block" v-model="participants[n - 1].dob" show-labels="false" :placeholders="['Date', 'Month', 'Year']" v-validate="{ required: true }" :data-vv-name="`participant-${n}-dob`" data-vv-value-path="value" select-placeholder-class="placeholder"></vue-dob-picker>
          <span class="error-message" v-show="errors.has(`participant-${n}-dob:required`)">* Participant's date of birth is required</span>
        </div>
      </div>
      <div class="row">
        <div class="col-1fr">
          <label>Any special requirements</label>
          <select v-model="participants[n - 1].specialRequirementsProvided" v-validate="{ required: true }" :data-vv-name="`participant-${n}-specialRequirementsProvided`" class="full-width-block">
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          <span class="error-message" v-show="errors.has(`participant-${n}-specialRequirementsProvided`)" >* You must select whether this participant has special requirements</span>
          <textarea v-show="participants[n - 1].specialRequirementsProvided === 'true'" class="full-width-block" v-model="participants[n - 1].specialRequirements" v-validate="participants[n - 1].specialRequirementsProvided === 'true' ? 'required' : ''" :data-vv-name="`participant-${n}-specialRequirements`" rows="5"></textarea>
          <span class="error-message" v-show="errors.has(`participant-${n}-specialRequirements`)">* If you have special requirements, you must provide them</span>
        </div>
        <div class="col-1fr">
          <label>Gender</label>
          <select v-model="participants[n - 1].gender" v-validate="{ required: true }" :data-vv-name="`participant-${n}-gender`" class="full-width-block">
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="undisclosed">Rather not say</option>
          </select>
          <span class="error-message" v-show="errors.has(`participant-${n}-gender:required`)">* Participant's gender is required</span>
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
            <input type="text" v-model="supervisor.firstName" v-validate="{ required: true }" data-vv-name="supervisor-firstName" class="full-width-block" />
            <span class="error-message" v-show="errors.has('supervisor-firstName')">* Supervisor's first name is required</span>
          </div>
          <div class="col">
            <label>Surname of Guardian</label>
            <input type="text" v-model="supervisor.lastName" v-validate="{ required: true }" data-vv-name="supervisor-firstName" class="full-width-block" />
            <span class="error-message" v-show="errors.has('supervisor-firstName')">* Supervisor's first name is required</span>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <label>Email of Adult Supervisor</label>
        <input type="email" placeholder="e.g. emily.smith@example.com" v-model="supervisor.email" v-validate="{ required: true, email: true }" data-vv-name="supervisor-email" class="full-width-block" />
        <span class="error-message" v-show="errors.has('supervisor-email:required')">* Supervisor's email is required</span>
        <span class="error-message" v-show="errors.has('supervisor-email:email')">* Supervisor's email must be a valid email address, e.g. emily.smith@example.com</span>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <label>Phone Number of Adult Supervisor</label>
        <input type="text" placeholder="e.g. +353851234567" v-model="supervisor.phone" v-validate="{ required: true, regex: /^\+[0-9\ \.\-]+$/ }" data-vv-name="supervisor-phone" class="full-width-block" />
        <span class="error-message" v-show="errors.has('supervisor-phone:required')">* Supervisor's phone number is required</span>
        <span class="error-message" v-show="errors.has('supervisor-phone:regex')">* Supervisor's phone number must include country code. e.g. for Ireland, +353</span>
      </div>
    </div>
    <hr />
    <div class="row">
      <div class="col">
        <p>If you have any questions about coolest projects please checkout <a href="http://www.coolestprojects.org">www.coolestprojects.org</a> or contact us at <a href="mailto:info@coolestprojects.org">info@coolestprojects.org</a>.</p>
      </div>
    </div>
    <div class="row">
      <div class="col text-center">
        <button type="submit" class="btn btn-primary">Finish Registration</button>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <span class="error-message" v-show="errors.any()">* You cannot finish registration until all the fields on this form are filled out correctly.</span>
      </div>
    </div>
  </form>
</template>

<script>
  import Vue from 'vue';
  import VueDobPicker from 'vue-dob-picker';
  import { ModelListSelect } from 'vue-search-select';
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
      ModelListSelect,
    },
    data() {
      return {
        dojos: [],
        numParticipants: 1,
        projectDetails: {},
        participants: [{ specialRequirementsProvided: false }],
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
              phone: this.supervisor.phone.replace(/[ .-]/g, ''),
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
            this.participants.push({ specialRequirementsProvided: false });
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
        const valid = await this.$validator.validateAll();
        if (valid) {
          const createdProject =
            (await ProjectService.create(this.event.id, this.projectPayload)).body;
          this.$router.push({
            name: 'CreateProjectCompleted',
            params: {
              eventId: this.event.id,
              projectId: createdProject.id,
              _event: this.event,
              _project: createdProject,
            },
          });
        }
      },
    },
    created() {
      this.fetchDojos();
    },
  };
</script>
