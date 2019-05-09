'use strict'

const express = require('express')
const bodyParser = require('body-parser')

async function startHttpAcceptor (port) {
  const app = express()
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser())
  const router = express.Router()

  app.use('/', router)
  return app.listen(port)
}

module.exports = startHttpAcceptor
