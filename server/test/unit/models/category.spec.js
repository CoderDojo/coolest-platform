const Category = require('../../../models/category');

describe('Category', () => {
  describe('constructor', () => {
    it('should create a Category with its attr', () => {
      const cat = new Category('HW', [10]);
      expect(cat.name).to.equal('HW');
      expect(cat.ages).to.eql([10]);
    });
  });
  describe('filters', () => {
    it('should return the filter when there is no age split', () => {
      const cat = new Category('HW');
      expect(cat.filters).to.eql([null]);
    });
    it('should return the filter when there is a single age split', () => {
      const cat = new Category('HW', [2]);
      expect(cat.filters).to.eql([['age', '<', 2], ['age', '>', 2]]);
    });
    it('should return the filter when there is multiple age split', () => {
      const cat = new Category('HW', [4, 2]);
      expect(cat.filters).to.eql([['age', '<', 2], [['age', '<', 4], ['age', '>', 2]], ['age', '>', 4]]);
    });
  });
});
