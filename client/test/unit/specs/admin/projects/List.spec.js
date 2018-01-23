import vueUnitHelper from 'vue-unit-helper';
import AdminProjectsList from '@/admin/projects/List';

describe('Admin Projects List component', () => {
  let sandbox;
  let vm;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    vm = vueUnitHelper(AdminProjectsList);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('computed', () => {
    describe('tableUrl', () => {
      it('should return a url with event id when event data is available', () => {
        // ARRANGE
        vm.event = {
          id: 'foo',
        };

        // ASSERT
        expect(vm.tableUrl).to.equal('/api/v1/events/foo/projects');
      });

      it('should return an empty string when event event data is not loaded', () => {
        // ARRANGE
        vm.event = {};

        // ASSERT
        expect(vm.tableUrl).to.equal('');
      });
    });

    describe('categoriesFilterOptions', () => {
      it('should return an empty array if categories have not loaded', () => {
        // ARRANGE
        vm.event = {};

        // ASSERT
        expect(vm.categoriesFilterOptions).to.deep.equal([]);
      });

      it('should transform categories to an array of {id, text}', () => {
        // ARRANGE
        vm.event = {
          categories: {
            cat1: 'Category 1',
            cat2: 'Category 2',
          },
        };

        // ASSERT
        expect(vm.categoriesFilterOptions).to.deep.equal([
          { id: 'cat1', text: 'Category 1' },
          { id: 'cat2', text: 'Category 2' },
        ]);
      });
    });

    describe('token', () => {
      it('should return the token from localStorage', () => {
        // ARRANGE
        sandbox.stub(localStorage, 'getItem').withArgs('authToken').returns('foo');

        // ASSERT
        expect(vm.token).to.equal('foo');
      });
    });

    describe('csvUrl', () => {
      it('should return an empty string if tableState does not have a query', () => {
        // ARRANGE
        vm.tableState = {};

        // ASSERT
        expect(vm.csvUrl).to.equal('');
      });

      it('should query params for fields with values', () => {
        // ARRANGE
        vm.event = { id: 'foo' };
        vm.token = 'bar';
        vm.tableState = {
          query: {
            name: 'baz',
            category: '',
            email: 'someone@example.com',
          },
        };

        // ASSERT
        expect(vm.csvUrl).to.equal('/api/v1/events/foo/projects?format=csv&token=bar&query[name]=baz&query[email]=someone%40example.com');
      });

      it('should include orderBy if tableState contains it', () => {
        // ARRANGE
        vm.event = { id: 'foo' };
        vm.token = 'bar';
        vm.tableState = { query: {}, orderBy: 'category' };

        // ASSERT
        expect(vm.csvUrl).to.equal('/api/v1/events/foo/projects?format=csv&token=bar&orderBy=category');
      });

      it('should include ascending if tableState contains it', () => {
        // ARRANGE
        vm.event = { id: 'foo' };
        vm.token = 'bar';
        vm.tableState = { query: {}, ascending: '1' };

        // ASSERT
        expect(vm.csvUrl).to.equal('/api/v1/events/foo/projects?format=csv&token=bar&ascending=1');
      });

      it('should include byColumn if tableState contains it', () => {
        // ARRANGE
        vm.event = { id: 'foo' };
        vm.token = 'bar';
        vm.tableState = { query: {}, byColumn: '1' };

        // ASSERT
        expect(vm.csvUrl).to.equal('/api/v1/events/foo/projects?format=csv&token=bar&byColumn=1');
      });

      it('should support all query params together', () => {
        // ARRANGE
        vm.event = { id: 'foo' };
        vm.token = 'bar';
        vm.tableState = {
          query: {
            name: 'baz',
            category: '',
            email: 'someone@example.com',
          },
          orderBy: 'category',
          ascending: '1',
          byColumn: '1',
        };

        // ASSERT
        expect(vm.csvUrl).to.equal('/api/v1/events/foo/projects?format=csv&token=bar&query[name]=baz&query[email]=someone%40example.com&orderBy=category&ascending=1&byColumn=1');
      });
    });
  });

  describe('methods', () => {
    describe('requestAdapter', () => {
      it('should store data into tableState and return it', () => {
        // ARRANGE
        vm.tableState = '';

        // ACT
        const res = vm.requestAdapter('foo');

        // ASSERT
        expect(vm.tableState).to.equal('foo');
        expect(res).to.equal('foo');
      });
    });
  });
});
