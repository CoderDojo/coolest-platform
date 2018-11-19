'use strict'

const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  GOOGLE_ANALYTICS_PROPERTY_ID: `"${process.env.GOOGLE_ANALYTICS_PROPERTY_ID}"` || '"UA-112027238-3"',
  EVENT_SLUG: `"${process.env.EVENT_SLUG}"` || '"cp-2018"',
});
