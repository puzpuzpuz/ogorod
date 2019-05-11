'use strict'

const express = require('express')
const { Storage } = require('../storage')
const HttpAcceptor = require('./http-acceptor')
const { asyncMiddleware } = require('../util/middlewares')
const AcceptorClient = require('./acceptor-client')

async function startAcceptorApi (port) {
  const storage = new Storage()
  const httpAcceptor = new HttpAcceptor(storage)

  const app = express()
  app.use(express.json({ limit: '100KB' }))
  app.set('etag', false)
  app.disable('x-powered-by')

  const router = express.Router()
  router.post('/internal-api/prepare',
    asyncMiddleware(httpAcceptor.prepare.bind(httpAcceptor))
  )
  router.post('/internal-api/accept',
    asyncMiddleware(httpAcceptor.accept.bind(httpAcceptor))
  )
  app.use('/', router)

  return app.listen(port)
}

exports.startAcceptorApi = startAcceptorApi
exports.AcceptorClient = AcceptorClient
