'use strict'

const startHttpProposer = require('./src/public-api')
const startHttpAcceptor = require('./src/internal-api')

const proposerIds = new Map([
  ['proposer-1', 'p1'],
  ['proposer-2', 'p2']
]);

(async () => {
  if (process.argv.length !== 4) {
    console.info('conf dir and hostname are expected as arguments')
    process.exit(1)
  }
  if (!proposerIds.has(process.argv[3])) {
    console.info(`unknown host: ${process.argv[3]} can't map to proposerId`)
    process.exit(1)
  }
  await startHttpProposer(proposerIds.get(process.argv[3]), process.argv[2], 8080)
})()
