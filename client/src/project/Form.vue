<template>
  <form novalidate @submit.prevent="onSubmit">
    <div class="row">
      <div class="col">
        <label>Project Name</label>
        <input
          v-model="projectDetails.name"
          v-validate="'required|max:50'"
          data-vv-name="projectName"
          placeholder="A few words to describe your project"
          class="full-width-block"
          :class="{ error: errors.has('projectName') }" />
        <span class="error-message" v-show="errors.has('projectName:required')">* A project name is required</span>
        <span class="error-message" v-show="errors.has('projectName:max')">A project name cannot be longer than 50 characters</span>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <label>Project Description</label>
        <textarea
          v-model="projectDetails.description"
          v-validate="'required|max:1000'"
          data-vv-name="projectDescription"
          placeholder="A few sentences to describe what your project is about and what technology you think you are using to build it."
          class="full-width-block"
          rows="4"
          :class="{ error: errors.has('projectDescription') }"></textarea>
        <span class="error-message" v-show="errors.has('projectDescription:required')">* A project description is required</span>
        <span class="error-message" v-show="errors.has('projectDescription:max')">A project description cannot be longer than 1000 characters</span>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <label>Project Category</label>
        <p><small><a href="http://coolestprojects.org/registration-2018/project-categories/" target="_blank">You can read the category descriptions here</a></small></p>
        <select
          v-model="projectDetails.category"
          v-validate="{ required: true }"
          data-vv-name="projectCategory"
          class="full-width-block"
          :class="{ placeholder: projectDetails.category === undefined, error: errors.has('projectCategory') }">
          <option :value="undefined" disabled>Please select a category</option>
          <option v-for="(label, value) in event.categories" :value="value">{{ label }}</option>
        </select>
        <span class="error-message" v-show="errors.has('projectCategory:required')">* A project category is required</span>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <label>Do you regularly attend a CoderDojo Dojo?</label>
        <div class="row row-no-margin">
          <div class="col-2fr">
            <select
              v-model="fromDojo"
              v-validate="{ required: true }"
              data-vv-name="fromDojo"
              class="full-width-block"
              :class="{ error: errors.has('fromDojo') }">
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
            <span class="error-message" v-show="errors.has('fromDojo:required')">* You must select whether the project is from a Dojo</span>
          </div>
          <div v-show="fromDojo === 'true'" class="col-3fr">
            <model-list-select
              v-model="projectDetails.dojoId"
              v-validate="fromDojo === 'true' ? 'required' : ''"
              data-vv-name="dojoId"
              class="full-width-block"
              :class="{ placeholder: projectDetails.category === undefined }"
              :list="dojos" placeholder="Type your Dojo name to select"
              option-value="id"
              option-text="name"
              :isError="errors.has('dojoId')"></model-list-select>
          </div>
        </div>
        <span class="error-message" v-show="errors.has('dojoId:required')">* If you attend a Dojo, you must select which Dojo</span>
      </div>
    </div>
    <div v-show="fromDojo === 'false'" class="row">
      <div class="col">
        <label>How did you hear about Coolest Projects (which Code Club, which school etc.)?</label>
        <div class="row row-no-margin">
          <div class="col">
            <input type="text"
              v-model="projectDetails.alternativeReference"
              v-validate="fromDojo === 'false' ? 'required' : ''"
              data-vv-name="alternativeReference"
              class="full-width-block" />
            <span class="error-message" v-show="errors.has('alternativeReference:required')">* It helps us to know where our attendees came from, please tell us how you came to Coolest Projects.</span>
          </div>
        </div>
      </div>
    </div>
    <hr />
    <div class="row">
      <div class="col">
        <label>How many participants are in this project?</label>
        <div class="row row-no-margin">
          <div class="col-2fr">
            <select v-model="numParticipants" class="full-width-block">
              <option v-for="n in 5" :value="n">{{ n }}</option>
            </select>
          </div>
          <div class="col-3fr"></div>
        </div>
      </div>
    </div>
    <div v-for="n in participants.length">
      <div class="row" v-show="participants.length > 1">
        <div class="col">
          <h3>Participant {{ n }}</h3>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <div class="row row-no-margin">
            <div class="col-1fr">
              <label>First name</label>
              <input
                type="text"
                placeholder="e.g. Emily"
                v-model="participants[n - 1].firstName"
                v-validate="{ required: true }"
                :data-vv-name="`participant-${n}-firstName`"
                class="full-width-block"
                :class="{ error: errors.has(`participant-${n}-firstName`) }" />
              <span class="error-message" v-show="errors.has(`participant-${n}-firstName:required`)">* Participant's first name is required</span>
            </div>
            <div class="col-1fr">
              <label>Surname</label>
              <input
                type="text"
                placeholder="e.g. Smith"
                v-model="participants[n - 1].lastName"
                v-validate="{ required: true }"
                :data-vv-name="`participant-${n}-lastName`"
                class="full-width-block"
                :class="{ error: errors.has(`participant-${n}-lastName`) }" />
              <span class="error-message" v-show="errors.has(`participant-${n}-lastName:required`)">* Participant's surname is required</span>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <label v-show="!participants[n - 1].name">Date of Birth</label>
          <label v-show="participants[n - 1].name">Date of Birth of "{{ participants[n - 1].name }}"</label>
          <vue-dob-picker
            class="full-width-block"
            v-model="participants[n - 1].dob"
            show-labels="false"
            :placeholders="['Date', 'Month', 'Year']"
            v-validate="{ required: true }"
            :data-vv-name="`participant-${n}-dob`"
            data-vv-value-path="value"
            :select-placeholder-class="errors.has(`participant-${n}-dob`) ? 'error placeholder' : 'placeholder'"
            :select-class="errors.has(`participant-${n}-dob`) ? 'error' : ''"></vue-dob-picker>
          <span class="error-message" v-show="errors.has(`participant-${n}-dob:required`)">* Participant's date of birth is required</span>
          <span class="warning-message" v-show="getAge(participants[n - 1].dob) >= 18">It looks like you are entering an age over 18. This section on the form is meant for the youths who helped build the project.</span>
        </div>
      </div>
      <div class="row">
        <div class="col-1fr">
          <label>Any special requirements?</label>
          <select v-model="participants[n - 1].specialRequirementsProvided" v-validate="{ required: true }" :data-vv-name="`participant-${n}-specialRequirementsProvided`" class="full-width-block">
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          <span class="error-message" v-show="errors.has(`participant-${n}-specialRequirementsProvided`)" >* You must select whether this participant has special requirements</span>
          <textarea
            v-show="participants[n - 1].specialRequirementsProvided === 'true'"
            class="full-width-block"
            v-model="participants[n - 1].specialRequirements"
            v-validate="participants[n - 1].specialRequirementsProvided === 'true' ? 'required' : ''"
            :data-vv-name="`participant-${n}-specialRequirements`"
            rows="5"
            :class="{ error: errors.has(`participant-${n}-specialRequirements`) }"></textarea>
          <span class="error-message" v-show="errors.has(`participant-${n}-specialRequirements`)">* If you have special requirements, you must provide them</span>
        </div>
        <div class="col-1fr">
          <label>Gender</label>
          <select
            v-model="participants[n - 1].gender"
            v-validate="{ required: true }"
            :data-vv-name="`participant-${n}-gender`"
            class="full-width-block"
            :class="{ error: errors.has(`participant-${n}-gender`) }">
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="undisclosed">Other/Rather not say</option>
          </select>
          <span class="error-message" v-show="errors.has(`participant-${n}-gender:required`)">* Participant's gender is required</span>
        </div>
      </div>
    </div>
    <hr />
    <div class="row">
      <div class="col">
        <p>We require each project to have one nominated adult supervisor. This person must attend Coolest Projects with the participants. You'll be able to change this until a few weeks before the event.</p>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <div class="row row-no-margin">
          <div class="col">
            <label>First Name of Adult Supervisor</label>
            <input
              type="text"
              v-model="supervisor.firstName"
              v-validate="{ required: true }"
              data-vv-name="supervisor-firstName"
              class="full-width-block"
              :class="{ error: errors.has('supervisor-firstName') }"
              placeholder="e.g. Emily" />
            <span class="error-message" v-show="errors.has('supervisor-firstName')">* Supervisor's first name is required</span>
          </div>
          <div class="col">
            <label>Surname of Adult Supervisor</label>
            <input
              type="text"
              v-model="supervisor.lastName"
              v-validate="{ required: true }"
              data-vv-name="supervisor-lastName"
              class="full-width-block"
              :class="{ error: errors.has('supervisor-lastName') }"
              placeholder="e.g. Smith" />
            <span class="error-message" v-show="errors.has('supervisor-lastName')">* Supervisor's surname is required</span>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <label>Email of Adult Supervisor</label>
        <input
          type="email"
          placeholder="e.g. emily.smith@example.com"
          v-model="supervisor.email"
          v-validate="{ required: true, email: true }"
          data-vv-name="supervisor-email"
          class="full-width-block"
          :class="{ error: errors.has('supervisor-email') }" />
        <span class="error-message" v-show="errors.has('supervisor-email:required')">* Supervisor's email is required</span>
        <span class="error-message" v-show="errors.has('supervisor-email:email')">* Supervisor's email must be a valid email address, e.g. emily.smith@example.com</span>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <label>Phone Number of Adult Supervisor</label>
        <input
          type="text"
          placeholder="e.g. +353851234567"
          v-model="supervisor.phone"
          v-validate="{ required: true, regex: /^\+[0-9\ \.\-]+$/ }"
          data-vv-name="supervisor-phone"
          class="full-width-block"
          :class="{ error: errors.has('supervisor-phone') }" />
        <span class="error-message" v-show="errors.has('supervisor-phone:required')">* Supervisor's phone number is required</span>
        <span class="error-message" v-show="errors.has('supervisor-phone:regex')">* Supervisor's phone number must include country code. e.g. for Ireland, +353</span>
      </div>
    </div>
    <hr />
    <div class="row">
      <div class="col">
        <p>If you have any questions about coolest projects please check out <a href="http://www.coolestprojects.org">www.coolestprojects.org</a> or contact us at <a href="mailto:info@coolestprojects.org">info@coolestprojects.org</a>.</p>
      </div>
    </div>
    <div class="row">
      <div class="col text-center">
        <button type="submit" class="btn btn-primary">Register Project</button>
      </div>
    </div>
    <div class="row">
      <div class="col" v-if="errors.any()">
        <span class="error-message">* You cannot finish registration until all the fields on this form are filled out correctly.</span>
      </div>
      <div class="col" v-if="error">
        <span class="error-message">Sorry. There was an problem registering your project, please contact <a href="email:info@coolestprojects.org">info@coolestprojects.org</a> so we can help you.</span>
      </div>
    </div>
    </div>
  </form>
</template>

<script>
  import Vue from 'vue';
  import VueDobPicker from 'vue-dob-picker';
  import { ModelListSelect } from 'vue-search-select';
  import { clone, pick } from 'lodash';
  import moment from 'moment';

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
      error: {
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
        fromDojo: undefined,
      };
    },
    computed: {
      projectPayload: {
        get() {
          const project = pick(this.projectDetails, [
            'id',
            'name',
            'description',
            'category',
            'dojoId',
            'alternativeReference',
          ]);
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
      fromDojo() {
        delete this.projectDetails.dojoId;
        delete this.projectDetails.alternativeReference;
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
          this.$emit('projectFormSubmitted', this.projectPayload);
        }
      },
      getAge: dob => moment().diff(dob, 'years'),
    },
    created() {
      this.fetchDojos();
    },
  };
</script>
