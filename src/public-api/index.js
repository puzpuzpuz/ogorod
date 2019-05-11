'use strict'

const express = require('express')
const { buildHttpProposer } = require('./http-proposer')
const { asyncMiddleware } = require('../util/middlewares')

async function startProposerApi (proposerId, acceptors, port) {
  const httpProposer = buildHttpProposer(proposerId, acceptors)

  const app = express()
  app.use(express.json({ limit: '100KB' }))
  app.set('etag', false)
  app.disable('x-powered-by')

  const router = express.Router()
  router.get('/api/:key',
    asyncMiddleware(httpProposer.read.bind(httpProposer))
  )
  router.put('/api/:key',
    asyncMiddleware(httpProposer.write.bind(httpProposer))
  )
  app.use('/', router)

  return app.listen(port)
}

exports.startProposerApi = startProposerApi
