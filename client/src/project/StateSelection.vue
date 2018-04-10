<template>
  <div class="row row-no-margin">
    <div class="col-2fr">
      <select class="full-width-block" v-model="selected" @blur="onBlur" @focus="onFocus" :class="{ error: hasError }">
        <option v-for="state in states" :value="state.value">{{ state.text }}</option>
      </select>
    </div>
    <div class="col-3fr">
      <input v-show="selected === 'other'" class="full-width-block" type="text" placeholder="Please specify" v-model="other" @blur="onBlur" @focus="onFocus" :class="{ error: hasError }" />
    </div>
  </div>
</template>

<script>
  let blurTimeout;

  export default {
    props: ['value', 'hasError'],
    data() {
      return {
        selected: null,
        other: null,
        states: [
          { value: 'AL', text: 'Alabama' },
          { value: 'AK', text: 'Alaska' },
          { value: 'AZ', text: 'Arizona' },
          { value: 'AR', text: 'Arkansas' },
          { value: 'CA', text: 'California' },
          { value: 'CO', text: 'Colorado' },
          { value: 'CT', text: 'Connecticut' },
          { value: 'DE', text: 'Delaware' },
          { value: 'DC', text: 'District Of Columbia' },
          { value: 'FL', text: 'Florida' },
          { value: 'GA', text: 'Georgia' },
          { value: 'HI', text: 'Hawaii' },
          { value: 'ID', text: 'Idaho' },
          { value: 'IL', text: 'Illinois' },
          { value: 'IN', text: 'Indiana' },
          { value: 'IA', text: 'Iowa' },
          { value: 'KS', text: 'Kansas' },
          { value: 'KY', text: 'Kentucky' },
          { value: 'LA', text: 'Louisiana' },
          { value: 'ME', text: 'Maine' },
          { value: 'MD', text: 'Maryland' },
          { value: 'MA', text: 'Massachusetts' },
          { value: 'MI', text: 'Michigan' },
          { value: 'MN', text: 'Minnesota' },
          { value: 'MS', text: 'Mississippi' },
          { value: 'MO', text: 'Missouri' },
          { value: 'MT', text: 'Montana' },
          { value: 'NE', text: 'Nebraska' },
          { value: 'NV', text: 'Nevada' },
          { value: 'NH', text: 'New Hampshire' },
          { value: 'NJ', text: 'New Jersey' },
          { value: 'NM', text: 'New Mexico' },
          { value: 'NY', text: 'New York' },
          { value: 'NC', text: 'North Carolina' },
          { value: 'ND', text: 'North Dakota' },
          { value: 'OH', text: 'Ohio' },
          { value: 'OK', text: 'Oklahoma' },
          { value: 'OR', text: 'Oregon' },
          { value: 'PA', text: 'Pennsylvania' },
          { value: 'RI', text: 'Rhode Island' },
          { value: 'SC', text: 'South Carolina' },
          { value: 'SD', text: 'South Dakota' },
          { value: 'TN', text: 'Tennessee' },
          { value: 'TX', text: 'Texas' },
          { value: 'UT', text: 'Utah' },
          { value: 'VT', text: 'Vermont' },
          { value: 'VA', text: 'Virginia' },
          { value: 'WA', text: 'Washington' },
          { value: 'WV', text: 'West Virginia' },
          { value: 'WI', text: 'Wisconsin' },
          { value: 'WY', text: 'Wyoming' },
          { value: 'other', text: 'Other/Non-USA' },
        ],
      };
    },
    computed: {
      state() {
        return this.selected === 'other' ? this.other : this.selected;
      },
    },
    watch: {
      state(val) {
        this.$emit('input', val);
      },
      value() {
        this.updateValue();
      },
    },
    methods: {
      onBlur() {
        blurTimeout = window.setTimeout(() => {
          this.$emit('blur');
        }, 50);
      },
      onFocus() {
        window.clearTimeout(blurTimeout);
      },
      updateValue() {
        if (this.states.find(state => state.value === this.value)) {
          this.selected = this.value;
        } else {
          this.selected = 'other';
          this.other = this.value;
        }
      },
    },
    created() {
      this.updateValue();
    },
  };
</script>
