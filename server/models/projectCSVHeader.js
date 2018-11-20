const CSVHeader = require('./CSVHeader');

module.exports = class ProjectCSVHeader extends CSVHeader {
  constructor(questions, nbParticipants) {
    super(questions);
    this.nbParticipants = nbParticipants;
  }
  get fields() {
    let fields = [
      { label: 'Project name', value: 'name' },
      { label: 'Description', value: 'description' },
      { label: 'Category', value: 'category' },
      { label: 'Owner Email', value: 'owner.email' },
      { label: 'Seat', value: 'seat.seat' },
      { label: 'Status', value: 'status' },
      { label: 'Created At', value: row => ProjectCSVHeader.dateFormat(row.createdAt) },
      { label: 'Updated At', value: row => ProjectCSVHeader.dateFormat(row.updatedAt) },
      { label: 'Supervisor First Name', value: 'supervisor.firstName' },
      { label: 'Supervisor Last Name', value: 'supervisor.lastName' },
      { label: 'Supervisor Email', value: 'supervisor.email' },
      { label: 'Supervisor Phone', value: 'supervisor.phone' },
    ];
    fields = fields.concat(this.questionFields);
    fields = fields.concat(this.participants);
    return fields;
  }
  get participants() {
    let participants = [];
    for (let i = 0; i < this.nbParticipants; i += 1) {
      const member = [
        { label: `Participant ${i + 1} First Name`, value: `members[${i}].firstName` },
        { label: `Participant ${i + 1} Last Name`, value: `members[${i}].lastName` },
        { label: `Participant ${i + 1} Dob`, value: `members[${i}].dob` },
        { label: `Participant ${i + 1} Gender`, value: `members[${i}].gender` },
        {
          label: `Participant ${i + 1} Special requirements`,
          value: `members[${i}].specialRequirements`,
        },
      ];
      participants = participants.concat(member);
    }
    return participants;
  }
};
