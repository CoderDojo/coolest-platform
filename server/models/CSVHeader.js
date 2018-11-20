module.exports = class CSVHeader {
  constructor(questions) {
    this.questions = questions;
  }
  get questionFields() {
    return (this.questions || []).map((question) => {
      return {
        label: `${question[0].toUpperCase()}${question.slice(1)}`.replace(/(_)/g, ' '),
        value: `answers.${question}`,
      };
    });
  }
  static dateFormat(date) {
    return new Date(date).toLocaleDateString();
  }
};
