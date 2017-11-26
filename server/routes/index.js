const requireindex = require('requireindex');
const path = require('path');

function addRoute(base, dir, app) {
  const routes = requireindex(dir);
  Object.entries(routes).forEach(([route, func]) => {
    const url = path.join(base, route);
    app.use(url, func);
    addRoute(url, path.join(dir, route), app);
  });
}

module.exports = (base, app) => addRoute(base, __dirname, app);
