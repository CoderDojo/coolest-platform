import scrollBehaviour from '@/router/scrollBehaviour';

describe('scrollBehaviour', () => {
  it('should return savedPosition if it passed in', () => {
    expect(scrollBehaviour({}, {}, 'savedPosition')).to.equal('savedPosition');
  });

  it('should return the hash selector if to has a hash', () => {
    expect(scrollBehaviour({ hash: 'val' }, {}, null)).to.deep.equal({ selector: 'val' });
  });

  it('should return top left if no saved position or hash', () => {
    expect(scrollBehaviour({}, {}, null)).to.deep.equal({ x: 0, y: 0 });
  });
});
