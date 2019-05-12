'use strict'

const path = require('path')
const nconf = require('nconf')

nconf
  .env({
    separator: '__',
    parseValues: true
  })
  .file('default', path.join(__dirname, '/../../config/default.json'))
  .required(['acceptors:nodes', 'acceptors:quorum'])

function get (key) {
  return nconf.get(key)
}

module.exports = {
  get
}
