'use strict'

const { startProposerApi } = require('./src/public-api')
const { startAcceptorApi } = require('./src/internal-api')
const config = require('./src/util/config')

const nodeId = config.get('nodeId')
const acceptors = config.get('acceptors')
const publicPort = config.get('publicPort')
const internalPort = config.get('internalPort')

startProposerApi(nodeId, acceptors, publicPort)
  .then(() => startAcceptorApi(internalPort))
  .then(() => console.log(`Started node ${nodeId} on port ${publicPort}`))
  .catch((e) => console.error(`Failed to start node ${nodeId}`, e))
