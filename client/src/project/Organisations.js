export default {
  data() {
    return {
      organisations: [
        'coderdojo',
        'codeclub',
        'raspberryjam',
        'certified_educator',
        'other',
      ],
    };
  },
  computed: {
    orgRegistration() {
      const labels = ['Attend a CoderDojo', 'Attend a Code Club', 'Attend a Raspberry Jam', 'Student of Raspberry Pi Certified Educator', 'Other'];
      return this.organisations.map((org, index) => {
        return { id: org, text: labels[index] };
      });
    },
    orgListing() {
      const labels = ['CoderDojo', 'Code Club', 'Raspberry Jam', 'Raspberry Pi Certified Educator', 'Other'];
      return this.organisations.map((org, index) => {
        return { id: org, text: labels[index] };
      });
    },
  },
};
