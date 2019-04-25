module.exports = class Category {
  constructor(name, ageSplit) {
    this.name = name;
    this.ages = ageSplit ? ageSplit.sort((a, b) => a - b) : [];
  }
  // eslint-disable-next-line class-methods-use-this 
  lowBoundFilter(age) {
    return ['age', '<=', age];
  }
  // eslint-disable-next-line class-methods-use-this 
  highBoundFilter(age) {
    return ['age', '>', age];
  }
  get filters() {
    let filters = [null];
    // Return an array of categories +1, as the age defines a split and we want whatever's after
    if (this.ages.length > 0) {
      const lastAge = this.ages[this.ages.length - 1];
      filters = this.ages
        .reduce((acc, age) => {
          if (acc.length > 0) {
            const prevAge = this.ages[acc.length - 1];
            acc.push([this.lowBoundFilter(age), this.highBoundFilter(prevAge)]);
          } else {
            acc.push(this.lowBoundFilter(age));
          }
          return acc;
        }, []);
      filters.push(this.highBoundFilter(lastAge));
    }
    return filters;
  }
};
