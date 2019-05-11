'use strict'

class HttpAcceptor {
  constructor (storage) {
    this.storage = storage
  }

  async prepare (req, res) {
    const { key, ballot } = req.body
    const result = this.storage.prepare(key, ballot)
    res.status(200)
    res.json(result)
  }

  async accept (req, res) {
    const { key, ballot, value, nextBallot } = req.body
    const result = this.storage.accept(key, ballot, value, nextBallot)
    res.status(200)
    res.send(result)
  }
}

module.exports = HttpAcceptor
