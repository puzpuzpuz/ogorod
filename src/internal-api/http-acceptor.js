'use strict'

class HttpAcceptor {
  constructor (storage) {
    this.storage = storage
  }

  async prepare (req, res) {
    const { key, ballot } = req.body
    try {
      const result = this.storage.prepare(key, ballot)
      res.json(result)
    } catch (e) {
      console.error(e)
      res.status(400)
      res.json({ code: 'UnknownError' })
    }
  }

  async accept (req, res) {
    const { key, ballot, value } = req.body
    try {
      const result = this.storage.accept(key, ballot, value)
      res.json(result)
    } catch (e) {
      console.error(e)
      res.status(400)
      res.json({ code: 'UnknownError' })
    }
  }
}

module.exports = HttpAcceptor
