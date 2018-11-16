// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  extends: 'coderdojo',
  rules: {
    'import/no-extraneous-dependencies': 'warn',
  },
  globals: {
    expect: true,
    sinon: true,
    app: true,
    db: true,
    util: true,
  },
  env: {
    mocha: true
  }
};
