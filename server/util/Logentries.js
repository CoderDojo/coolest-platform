const Transport = require('winston-transport');
const Logger = require('le_node');

module.exports = class Logentries extends Transport {
  constructor(opts) {
    super(opts);
    this.logger = new Logger({ token: opts.logentries_token });
  }

  log(level, msg, meta, callback) {
    this.logger(level, msg);
    callback();
  }
};
