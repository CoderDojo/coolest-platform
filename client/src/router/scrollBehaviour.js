export default (to, from, savedPosition) => {
  if (savedPosition) {
    return savedPosition;
  } else if (to.hash) {
    return {
      selector: to.hash,
    };
  }
  return { x: 0, y: 0 };
};
