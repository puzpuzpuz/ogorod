'use strict'

const { Proposer, BallotNumber, ProposerError } = require('../core')
const { AcceptorClient } = require('../internal-api')

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
    await this.apply(key, _ => req.body, res)
  }

  async apply (key, fn, res) {
    res.setHeader('Content-Type', 'application/json')

    let value = null
    try {
      value = await this.proposer.change(key, fn)
    } catch (e) {
      console.error(e)
      res.status(400)
      if (e instanceof ProposerError) {
        res.json({ code: e.code })
      } else {
        res.json({ code: 'UnknownError' })
      }
      return
    }

    if (value === null) {
      res.sendStatus(404)
    } else {
      res.json(value)
    }
  }
}

function buildHttpProposer (proposerId, acceptors) {
  const clients = acceptors.nodes.map(endpoint => new AcceptorClient(endpoint, x => BallotNumber.parse(x)))
  const proposer = new Proposer(
    new BallotNumber(0, `${proposerId}`),
    {
      nodes: clients,
      quorum: acceptors.quorum
    },
    {
      nodes: clients,
      quorum: acceptors.quorum
    }
  )
  return new HttpProposer(proposer)
}

exports.buildHttpProposer = buildHttpProposer
exports.HttpProposer = HttpProposer
