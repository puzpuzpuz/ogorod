'use strict'

const { ProposerError } = require('../core')

class HttpProposer {
  constructor (proposer) {
    this.proposer = proposer
  }

  async read (req, res) {
    const key = req.params.key
    await this.apply(key, val => val, res)
  }

  async write (req, res) {
    const key = req.params.key
    await this.apply(_ => req.params.body, res)
  }

  async apply (key, fn, res) {
    res.setHeader('Content-Type', 'application/json')
    
    let state = null
    try {
      state = await this.proposer.change(key, fn)
    } catch (e) {
      console.info(e)
      res.setHeader('Content-Type', 'application/json')
      res.status(400)
      if (e instanceof ProposerError) {
        res.send(JSON.stringify({ 'code': e.code }))
      } else {
        res.send(JSON.stringify({ 'code': 'UnknownError' }))
      }
      return
    }
    res.status(200)
    res.send(JSON.stringify({ 'value': state }))
  }

}

module.exports = HttpProposer
