/*  eslint-disable import/no-extraneous-dependencies */
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);

chai.config.includeStack = true;
global.expect = chai.expect;
global.sinon = sinon;
/*  eslint-enable import/no-extraneous-dependencies */
