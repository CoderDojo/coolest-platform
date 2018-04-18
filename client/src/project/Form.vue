<template>
  <form novalidate @submit.prevent="onSubmit">
    <div class="row">
      <div class="col">
        <label>Project name</label>
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
        <label>Project description</label>
        <textarea
          v-model="projectDetails.description"
          v-validate="'required|max:1000'"
          data-vv-name="projectDescription"
          placeholder="A few sentences to describe what your project is about and what technology you are using to build it. This will be used on a project poster and on the website on the day of the event."
          class="full-width-block"
          rows="4"
          :class="{ error: errors.has('projectDescription') }"></textarea>
        <span class="error-message" v-show="errors.has('projectDescription:required')">* A project description is required</span>
        <span class="error-message" v-show="errors.has('projectDescription:max')">A project description cannot be longer than 1000 characters</span>
      </div>
    </div>
    <div v-if="hasQuestion('other_requirements')" class="row">
      <div class="col">
        <label>Do you have any technical requests or requirements for your project?</label>
        <textarea v-model="answers.other_requirements"
          class="full-width-block"
          rows="4"/>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <label>Project category</label>
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
        <label>Which of the following do you attend?</label>
        <div class="row row-no-margin">
          <div class="col-2fr">
            <select
              v-model="org"
              v-validate="{ required: true }"
              data-vv-name="org"
              class="full-width-block"
              :class="{ error: errors.has('org') }">
              <option :value="undefined" disabled></option>
              <option value="coderdojo">CoderDojo</option>
              <option value="codeclub">Code Club</option>
              <option value="pioneers">Pioneers</option>
              <option value="raspberryjam">Raspberry Jam</option>
              <option value="other">Other</option>
            </select>
            <span class="error-message" v-show="errors.has('org:required')">* You must select where this project is from</span>
          </div>
          <div v-show="org === 'coderdojo'" class="col-3fr">
            <model-list-select
              v-model="projectDetails.orgRef"
              v-validate="org === 'coderdojo' ? 'required' : ''"
              data-vv-name="orgRef"
              class="full-width-block"
              :class="{ placeholder: projectDetails.category === undefined }"
              :list="dojos" placeholder="Type your Dojo name to select"
              option-value="id"
              option-text="name"
              :isError="errors.has('orgRef')"></model-list-select>
          </div>
        </div>
        <span class="error-message" v-show="org === 'coderdojo' && errors.has('orgRef:required')">* If you attend a Dojo, you must select which Dojo</span>
      </div>
    </div>
    <div v-show="org && org !== 'coderdojo'" class="row">
      <div class="col">
        <label v-if="org === 'other'">Please describe.</label>
        <label v-else>Please tell us which Code Club or Raspberry Jam you attend or let us know when you participated in Pioneers.</label>
        <div class="row row-no-margin">
          <div class="col">
            <input type="text"
            v-model="projectDetails.orgRef"
            v-validate="org && org !== 'coderdojo' ? 'required' : ''"
            data-vv-name="orgRef"
            class="full-width-block"
            :class="{ error: errors.has('orgRef') }" />
            <span class="error-message" v-show="errors.has('orgRef:required')">* It helps us to know where our attendees came from, please tell us how you came to Coolest Projects.</span>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <label>State</label>
        <state-selection v-model="projectDetails.state" v-validate="'required'" data-vv-name="state" data-vv-value-path="value" :has-error="errors.has('state:required')"></state-selection>
        <span class="error-message" v-show="errors.has('state:required')">* State is required.</span>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <label>City</label>
        <div class="row row-no-margin">
          <div class="col">
            <input type="text" v-model="projectDetails.city" v-validate="'required'" data-vv-name="city" class="full-width-block" :class="{ error: errors.has('city:required') }" />
            <span class="error-message" v-show="errors.has('city:required')">* City is required.</span>
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
              <label>Last name</label>
              <input
                type="text"
                placeholder="e.g. Smith"
                v-model="participants[n - 1].lastName"
                v-validate="{ required: true }"
                :data-vv-name="`participant-${n}-lastName`"
                class="full-width-block"
                :class="{ error: errors.has(`participant-${n}-lastName`) }" />
              <span class="error-message" v-show="errors.has(`participant-${n}-lastName:required`)">* Participant's last name is required</span>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <label v-show="!participants[n - 1].name">Date of birth</label>
          <label v-show="participants[n - 1].name">Date of birth of "{{ participants[n - 1].name }}"</label>
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
            <option :value="true">Yes</option>
            <option :value="false">No</option>
          </select>
          <span class="error-message" v-show="errors.has(`participant-${n}-specialRequirementsProvided`)" >* You must select whether this participant has special requirements</span>
          <textarea
            v-show="participants[n - 1].specialRequirementsProvided"
            class="full-width-block"
            v-model="participants[n - 1].specialRequirements"
            v-validate="participants[n - 1].specialRequirementsProvided ? 'required' : ''"
            :data-vv-name="`participant-${n}-specialRequirements`"
            rows="5"
            placeholder="Please add any allergies, disability requirements or special requests so we can try to facilitate these on the day."
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
              <option value="undisclosed">Rather not say</option>
          </select>
          <span class="error-message" v-show="errors.has(`participant-${n}-gender:required`)">* We want everyone to enjoy Coolest Projects equally. Gathering this information helps us check how well we’re doing.</span>
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
            <label>First name of adult supervisor</label>
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
            <label>Last name of adult supervisor</label>
            <input
              type="text"
              v-model="supervisor.lastName"
              v-validate="{ required: true }"
              data-vv-name="supervisor-lastName"
              class="full-width-block"
              :class="{ error: errors.has('supervisor-lastName') }"
              placeholder="e.g. Smith" />
            <span class="error-message" v-show="errors.has('supervisor-lastName')">* Supervisor's last name is required</span>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <label>Email of adult supervisor</label>
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
        <label>Phone number of adult supervisor</label>
        <input
          type="text"
          placeholder="e.g. 233 456 7890"
          v-model="supervisor.phone"
          v-validate="{ required: true, regex: /^[0-9\ \.\-\(\)]+$/ }"
          data-vv-name="supervisor-phone"
          class="full-width-block"
          :class="{ error: errors.has('supervisor-phone') }" />
        <span class="error-message" v-show="errors.has('supervisor-phone:required')">* Supervisor's phone number is required</span>
        <span class="error-message" v-show="errors.has('supervisor-phone:regex')">* Please enter a valid phone number. Only numbers, spaces, dashes, dots and brackets are valid.</span>
      </div>
    </div>
    <hr />
    <div class="row">
      <div class="col">
        <p>If you have any questions about Coolest Projects please check out <a :href="`http://${event.homepage}`">{{ event.homepage }}</a> or contact us at <a :href="`mailto:${event.contact}`">{{ event.contact }}</a>.</p>
      </div>
    </div>
    <div class="row">
      <div class="col text-center">
        <button type="submit" class="btn btn-primary">{{ submitButtonText }}</button>
      </div>
    </div>
    <div class="row">
      <div class="col" v-if="errors.any()">
        <span class="error-message">* You cannot finish registration until all the fields on this form are filled out correctly.</span>
      </div>
      <div class="col" v-if="error">
        <span class="error-message">Sorry. There was an problem registering your project, please contact <a :href="`mailto:${event.contact}`">{{ event.contact }}</a> so we can help you.</span>
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
  import StateSelection from '@/project/StateSelection';
  import ProjectService from '@/project/service';
  import EventUtilsMixin from '@/event/EventUtilsMixin';

  export default {
    name: 'ProjectForm',
    mixins: [EventUtilsMixin],
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
      StateSelection,
    },
    data() {
      return {
        dojos: [],
        numParticipants: 1,
        projectDetails: {},
        projectQuestions: ['other_requirements'],
        answers: {},
        participants: [{ specialRequirementsProvided: false }],
        supervisor: {},
        org: undefined,
        submitted: false,
        error: null,
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
            'org',
            'orgRef',
            'state',
            'city',
          ]);
          project.users = this.participants.map((participant) => {
            const _participant = pick(participant, [
              'id',
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
              id: this.supervisor.id,
              firstName: this.supervisor.firstName,
              lastName: this.supervisor.lastName,
              email: this.supervisor.email,
              phone: this.supervisor.phone.replace(/[ .\-()]/g, ''),
              type: 'supervisor',
            },
          ];
          project.answers = this.answers;

          return project;
        },
        set(project) {
          this.projectDetails = pick(project, [
            'id', 'name', 'description', 'category',
            'org', 'orgRef', 'state', 'city',
          ]);
          this.org = project.org;
          this.participants = project.members.map((user) => {
            const _user = clone(user);
            _user.specialRequirementsProvided = !!user.specialRequirements;
            _user.dob = new Date(user.dob);
            delete _user.type;
            return _user;
          });
          this.numParticipants = this.participants.length;
          this.supervisor = project.supervisor;
          this.answers = project.answers;
          delete this.supervisor.type;
        },
      },
      submitButtonText() {
        if (this.projectDetails.id) {
          return 'Update project';
        }
        return this.event.requiresApproval ? 'Submit project' : 'Register project';
      },
    },
    watch: {
      org(newOrg) {
        if (this.projectDetails.org !== newOrg) {
          this.projectDetails.orgRef = undefined;
          this.projectDetails.org = newOrg;
        }
      },
      numParticipants(newLength) {
        const oldLength = this.participants.length;
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
            stage: { ne$: 4 },
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
          let project;
          if (this.projectPayload.id) {
            project = await this.update();
          } else {
            project = await this.register();
          }
          window.removeEventListener('beforeunload', this.onBeforeUnload);
          this.submitted = true;
          const nextRouteNamePrefix = this.$route.path.startsWith('/admin/') ? 'Admin' : '';
          this.$router.push({
            name: this.event.questions && this.event.questions.length > 0 ? `${nextRouteNamePrefix}ProjectExtraDetails` : 'CreateProjectCompleted',
            params: {
              eventSlug: this.event.slug,
              projectId: project.id,
              _event: this.event,
              _project: project,
            },
          });
        }
      },
      async register() {
        try {
          const project = (await ProjectService.create(this.event.id, this.projectPayload)).body;
          this.$ga.event({
            eventCategory: 'ProjectRegistration',
            eventAction: 'NewProject',
            eventLabel: this.event.id,
          });
          return project;
        } catch (err) {
          this.error = err;
        }
      },
      async update() {
        try {
          const project =
            (await ProjectService.update(this.event.id, this.project.id, this.projectPayload)).body;
          this.$ga.event({
            eventCategory: 'ProjectRegistration',
            eventAction: 'UpdateProject',
            eventLabel: this.event.id,
          });
          return project;
        } catch (err) {
          this.error = err;
        }
      },
      onBeforeUnload(e) {
        const msg = 'Are you sure you don\'t want to complete your registration application?';
        e.returnValue = msg;
        return msg;
      },
      getAge: dob => moment().diff(dob, 'years'),
    },
    created() {
      if (this.project) {
        this.projectPayload = this.project;
      } else {
        this.answers = this.projectQuestions
          .filter(question => question !== 'other_requirements')
          .reduce((acc, key, value) => { acc[key] = false; return acc; }, {});
      }
      window.addEventListener('beforeunload', this.onBeforeUnload);
      this.fetchDojos();
    },
    destroyed() {
      window.removeEventListener('beforeunload', this.onBeforeUnload);
    },
    beforeRouteLeave(to, from, next) {
      if (this.submitted) {
        next();
      } else {
        // eslint-disable-next-line
        next(confirm('Are you sure you don\'t want to complete your registration application?'));
      }
    },
  };
</script>
