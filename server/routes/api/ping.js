module.exports = (router, prefix) => {
  router.get(`${prefix}/ping`, (req, res) => {
    res.send(204);
  });
};
