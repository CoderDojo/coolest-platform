const projectCSVHeader = (questions, nbParticipants) => {
  const dateFormat = date => new Date(date).toLocaleDateString();
  const questionFields = (questions || []).map((question) => {
    return {
      label: `${question[0].toUpperCase()}${question.slice(1)}`.replace(/(_)/g, ' '),
      value: `answers.${question}`,
    };
  });
  let fields = [
    { label: 'Name', value: 'name' },
    { label: 'Description', value: 'description' },
    { label: 'Category', value: 'category' },
    { label: 'Owner Email', value: 'owner.email' },
    { label: 'Status', value: 'status' },
    { label: 'Created At', value: row => dateFormat(row.createdAt) },
    { label: 'Updated At', value: row => dateFormat(row.updatedAt) },
    { label: 'Supervisor First Name', value: 'supervisor.firstName' },
    { label: 'Supervisor Last Name', value: 'supervisor.lastName' },
    { label: 'Supervisor Email', value: 'supervisor.email' },
    { label: 'Supervisor Phone', value: 'supervisor.phone' },
  ];
  fields = fields.concat(questionFields);
  for (let i = 0; i < nbParticipants; i += 1) {
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
    fields = fields.concat(member);
  }
  return fields;
};

module.exports = projectCSVHeader;
