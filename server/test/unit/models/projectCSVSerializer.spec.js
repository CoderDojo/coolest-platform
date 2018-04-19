const CSVHeader = require('../../../models/projectCSVSerializer');

describe('project CSV serializer', () => {
  const baseHeader = [
    {
      label: 'Name',
      value: 'name',
    },
    {
      label: 'Description',
      value: 'description',
    },
    {
      label: 'Category',
      value: 'category',
    },
    {
      label: 'Owner Email',
      value: 'owner.email',
    },
    {
      label: 'Status',
      value: 'status',
    },
    {
      label: 'Created At',
      value: Function,
    },
    {
      label: 'Updated At',
      value: Function,
    },
    {
      label: 'Supervisor First Name',
      value: 'supervisor.firstName',
    },
    {
      label: 'Supervisor Last Name',
      value: 'supervisor.lastName',
    },
    {
      label: 'Supervisor Email',
      value: 'supervisor.email',
    },
    {
      label: 'Supervisor Phone',
      value: 'supervisor.phone',
    }];
  const questionsHeader = ['Question 1', 'Question 2'];
  const participantsHeader = ['Participant 1 First Name', 'Participant 1 Last Name', 'Participant 1 Dob', 'Participant 1 Gender', 'Participant 1 Special requirements']
    .concat(['Participant 2 First Name', 'Participant 2 Last Name', 'Participant 2 Dob', 'Participant 2 Gender', 'Participant 2 Special requirements']);

  it('should return a csv header without participants nor questions', () => {
    const res = CSVHeader([], 0);
    expect(res.map(l => l.label)).to.have.all.members(baseHeader.map(l => l.label));
  });

  it('should return a csv header with participants but no questions', () => {
    const res = CSVHeader([], 2);
    expect(res.map(l => l.label))
      .to.have.all.members(baseHeader
        .map(l => l.label).concat(participantsHeader));
  });
  it('should return a csv header with no participants but with some questions', () => {
    const res = CSVHeader(['question_1', 'question_2'], 0);
    expect(res.map(l => l.label))
      .to.have.all.members(baseHeader
        .map(l => l.label).concat(questionsHeader));
  });
  it('should return a csv header with participants and questions', () => {
    const res = CSVHeader(['question_1', 'question_2'], 2);
    expect(res.map(l => l.label))
      .to.have.all.members(baseHeader
        .map(l => l.label).concat(questionsHeader).concat(participantsHeader));
  });
});
