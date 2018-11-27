const CSVHeader = require('../../../models/userCSVHeader');

describe('User CSV header', () => {
  const baseHeader = [
    {
      label: 'Project ID',
      value: 'id',
    },
    {
      label: 'First name',
      value: 'firstName',
    },
    {
      label: 'Last name',
      value: 'lastName',
    },
    {
      label: 'Dob',
      value: 'dob',
    },
    {
      label: 'Gender',
      value: 'gender',
    },
    {
      label: 'Special requirements',
      value: 'specialRequirements',
    },
    {
      label: 'Project name',
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
      label: 'City',
      value: 'city',
    },
    {
      label: 'State',
      value: 'state',
    },
    {
      label: 'Owner Email',
      value: 'owner.email',
    },
    {
      label: 'Seat',
      value: 'seat',
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

  it('should return a csv header without participants nor questions', () => {
    const res = new CSVHeader([]).fields;
    expect(res.map(l => l.label)).to.have.all.members(baseHeader.map(l => l.label));
  });

  it('should return a csv header with questions', () => {
    const res = new CSVHeader(['question_1', 'question_2']).fields;
    expect(res.map(l => l.label))
      .to.have.all.members(baseHeader
        .map(l => l.label).concat(questionsHeader));
  });
});
