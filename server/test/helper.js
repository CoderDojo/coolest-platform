const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);

chai.config.includeStack = true;
global.expect = chai.expect;
global.sinon = sinon;
