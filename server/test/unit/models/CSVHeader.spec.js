const CSVHeader = require('../../../models/CSVHeader');

describe('project CSV header', () => {
  let CSV;
  before(() => {
    CSV = new CSVHeader(['social_project']);
  });
  describe('dateFormat', () => {
    it('should format a date', () => {
      const date = CSVHeader.dateFormat('2018-11-14T23:53:00.000Z');
      expect(date).to.equal('2018-11-14');
    });
  });
  describe('questionFields', () => {
    it('should transform the questions into supported format for CSV headers', () => {
      const questions = CSV.questionFields;
      expect(questions).to.eql([{ label: 'Social project', value: 'answers.social_project' }]);
    });
  });
});
