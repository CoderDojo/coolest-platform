const CSVHeader = require('./CSVHeader');

module.exports = class UserCSVHeader extends CSVHeader {
  get fields() {
    let fields = [
      { label: 'Project ID', value: 'id' },
      { label: 'First name', value: 'firstName' },
      { label: 'Last name', value: 'lastName' },
      { label: 'Dob', value: 'dob' },
      { label: 'Gender', value: 'gender' },
      { label: 'Special requirements', value: 'specialRequirements' },
      { label: 'Project name', value: 'name' },
      { label: 'Description', value: 'description' },
      { label: 'Category', value: 'category' },
      { label: 'City', value: 'city' },
      { label: 'State', value: 'state' },
      { label: 'Organisation', value: 'org' },
      { label: 'Reference of organisation', value: 'orgRef' },
      { label: 'Owner Email', value: 'owner.email' },
      { label: 'Seat', value: 'seat.seat' },
      { label: 'Status', value: 'status' },
      { label: 'Created At', value: row => UserCSVHeader.dateFormat(row.createdAt) },
      { label: 'Updated At', value: row => UserCSVHeader.dateFormat(row.updatedAt) },
      { label: 'Supervisor First Name', value: 'supervisor.firstName' },
      { label: 'Supervisor Last Name', value: 'supervisor.lastName' },
      { label: 'Supervisor Email', value: 'supervisor.email' },
      { label: 'Supervisor Phone', value: 'supervisor.phone' },
    ];
    fields = fields.concat(this.questionFields);
    return fields;
  }
};
