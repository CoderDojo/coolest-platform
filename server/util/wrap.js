const { METHODS } = require('http');

const wrap = fn => (...args) => Promise.resolve(fn(...args)).catch(args[2]);

module.exports = (app) => {
  METHODS.forEach((method) => {
    const original = app[method.toLowerCase()];
    app[method.toLowerCase()] = (...args) =>
      original.call(app, ...args.map(arg => (typeof arg === 'function' ? wrap(arg) : arg)));
  });
  return app;
};
