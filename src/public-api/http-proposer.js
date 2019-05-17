'use strict'

const { Proposer, BallotNumber, ProposerError } = require('../core')
const { AcceptorClient } = require('../internal-api')

class HttpProposer {
  constructor (proposer) {
    this.proposer = proposer
  }

  async read (req, res) {
    const key = req.params.key
    await this.apply(key, state => state, res)
  }

  async write (req, res) {
    const key = req.params.key
    const writeFn = state => {
      const nextVersion = state ? state.version + 1 : 0
      return {
        version: nextVersion,
        value: req.body
      }
    }
    await this.apply(key, writeFn, res)
  }

  async cas (req, res) {
    const key = req.params.key
    const { value, version } = req.body
    const casFn = state => {
      if (state !== null && state.version === version) {
        return {
          version: state.version + 1,
          value
        }
      }
      return state
    }
    await this.apply(key, casFn, res)
  }

  async apply (key, fn, res) {
    res.setHeader('Content-Type', 'application/json')

    let state = null
    try {
      state = await this.proposer.change(key, fn)
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

    if (state === null) {
      res.sendStatus(404)
    } else {
      res.json(state)
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
    }
  )
  return new HttpProposer(proposer)
}

exports.buildHttpProposer = buildHttpProposer
exports.HttpProposer = HttpProposer
