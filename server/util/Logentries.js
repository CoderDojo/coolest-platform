const Transport = require('winston-transport');
const Logger = require('le_node');

module.exports = class Logentreis extends Transport {
  constructor(opts) {
    super(opts);
    this.logger = new Logger({ token: opts.logentreis_token });
  }

  log(level, msg, meta, callback) {
    this.logger(level, msg);
    callback();
  }
};
