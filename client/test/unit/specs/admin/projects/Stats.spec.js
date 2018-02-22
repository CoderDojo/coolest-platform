import vueUnitHelper from 'vue-unit-helper';
import AdminProjectStats from '!!vue-loader?inject!@/admin/projects/Stats';

describe('AdminProjectStats component', () => {
  // let sandbox;
  let vm;
  const user1 = {
    id: 1,
    gender: 'female',
    membership: [{ type: 'member' }],
  };
  const user2 = {
    id: 2,
    email: 'supervisor1@example.com',
    membership: [{ type: 'supervisor' }],
  };
  const user3 = {
    id: 3,
    gender: 'male',
    membership: [{ type: 'member' }],
  };
  const user4 = {
    id: 4,
    gender: 'female',
    membership: [{ type: 'member' }],
  };
  const user5 = {
    id: 5,
    membership: [{ type: 'owner' }],
  };
  const user6 = {
    id: 6,
    gender: 'undisclosed',
    membership: [{ type: 'member' }],
  };
  const user7 = {
    id: 7,
    gender: 'male',
    membership: [{ type: 'member' }],
  };
  const user8 = {
    id: 8,
    email: 'supervisor2@example.com',
    membership: [{ type: 'supervisor' }],
  };
  const user9 = {
    id: 9,
    gender: 'undisclosed',
    membership: [{ type: 'member' }],
  };
  const user10 = {
    id: 9,
    gender: 'female',
    membership: [{ type: 'member' }],
  };
  const user11 = {
    id: 11,
    email: 'supervisor2@example.com',
    membership: [{ type: 'supervisor' }],
  };

  const project1 = { org: 'coderdojo' };
  const project2 = { org: 'codeclub' };
  const project3 = { org: 'coderdojo' };
  const project4 = { org: 'coderdojo' };
  const project5 = { org: 'pioneers' };
  const project6 = { org: 'other' };
  const project7 = { org: 'coderdojo' };
  const project8 = { org: 'raspberryjam' };
  const project9 = { org: 'codeclub' };

  beforeEach(() => {
    // sandbox = sinon.sandbox.create();
    vm = vueUnitHelper(AdminProjectStats());
    vm.users = [
      user1,
      user2,
      user3,
      user4,
      user5,
      user6,
      user7,
      user8,
      user9,
      user10,
      user11,
    ];
    vm.projects = [
      project1,
      project2,
      project3,
      project4,
      project5,
      project6,
      project7,
      project8,
      project9,
    ];
  });

  describe('computed', () => {
    describe('members', () => {
      it('should filter users to only members', () => {
        // ASSERT
        expect(vm.members).to.deep.equal([
          user1,
          user3,
          user4,
          user6,
          user7,
          user9,
          user10,
        ]);
      });
    });

    describe('membersMale', () => {
      it('should return only male members', () => {
        // ASSERT
        expect(vm.membersMale).to.deep.equal([user3, user7]);
      });
    });

    describe('membersFemale', () => {
      it('should return only female members', () => {
        // ASSERT
        expect(vm.membersFemale).to.deep.equal([user1, user4, user10]);
      });
    });

    describe('membersUndisclosed', () => {
      it('should return only members of undisclosed gender', () => {
        // ASSERT
        expect(vm.membersUndisclosed).to.deep.equal([user6, user9]);
      });
    });

    describe('membersMalePercentage', () => {
      it('should return the percentage of male members', () => {
        // ASSERT
        expect(vm.membersMalePercentage).to.equal(29);
      });
    });

    describe('membersFemalePercentage', () => {
      it('should return the percentage of female members', () => {
        // ASSERT
        expect(vm.membersFemalePercentage).to.equal(43);
      });
    });

    describe('membersUndisclosedPercentage', () => {
      it('should return the percentage of members of undisclosed gender', () => {
        // ASSERT
        expect(vm.membersUndisclosedPercentage).to.equal(29);
      });
    });

    describe('supervisors', () => {
      it('should filter users to only supervisors, excluding duplicates (same email)', () => {
        // ASSERT
        expect(vm.supervisors).to.deep.equal([user2, user8]);
      });
    });

    describe('coderDojoProjects', () => {
      it('should filter projects to only CoderDojo projects', () => {
        // ASSERT
        expect(vm.coderDojoProjects).to.deep.equal([project1, project3, project4, project7]);
      });
    });

    describe('codeClubProjects', () => {
      it('should filter projects to only Code Club projects', () => {
        // ASSERT
        expect(vm.codeClubProjects).to.deep.equal([project2, project9]);
      });
    });

    describe('raspberryJamProjects', () => {
      it('should filter projects to only Raspberry Jam projects', () => {
        // ASSERT
        expect(vm.raspberryJamProjects).to.deep.equal([project8]);
      });
    });

    describe('pioneersProjects', () => {
      it('should filter projects to only Pioneers projects', () => {
        // ASSERT
        expect(vm.pioneersProjects).to.deep.equal([project5]);
      });
    });

    describe('otherProjects', () => {
      it('should filter projects to only CoderDojo projects', () => {
        // ASSERT
        expect(vm.otherProjects).to.deep.equal([project6]);
      });
    });

    describe('coderDojoProjectsPercentage', () => {
      it('should return the percentage of projects from CoderDojo', () => {
        // ASSERT
        expect(vm.coderDojoProjectsPercentage).to.equal(44);
      });
    });

    describe('codeClubProjectsPercentage', () => {
      it('should return the percentage of projects from CoderDojo', () => {
        // ASSERT
        expect(vm.codeClubProjectsPercentage).to.equal(22);
      });
    });

    describe('raspberryJamProjectsPercentage', () => {
      it('should return the percentage of projects from CoderDojo', () => {
        // ASSERT
        expect(vm.raspberryJamProjectsPercentage).to.equal(11);
      });
    });

    describe('pioneersProjectsPercentage', () => {
      it('should return the percentage of projects from CoderDojo', () => {
        // ASSERT
        expect(vm.pioneersProjectsPercentage).to.equal(11);
      });
    });

    describe('otherProjectsPercentage', () => {
      it('should return the percentage of projects from others', () => {
        // ASSERT
        expect(vm.otherProjectsPercentage).to.equal(11);
      });
    });
  });
});
