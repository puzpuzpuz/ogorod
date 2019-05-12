'use strict'

const { startProposerApi } = require('./src/public-api')
const { startAcceptorApi } = require('./src/internal-api')
const config = require('./src/util/config')

const proposerId = config.get('proposerId')
const acceptors = config.get('acceptors')
const publicPort = config.get('publicPort')
const internalPort = config.get('internalPort')

startProposerApi(proposerId, acceptors, publicPort)
  .then(() => startAcceptorApi(internalPort))
  .then(() => console.log(`Started node ${proposerId} on port ${publicPort} with known acceptors:`, acceptors))
  .catch((e) => console.error(`Failed to start node ${proposerId}`, e))
