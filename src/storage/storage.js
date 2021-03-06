'use strict'

const { BallotNumber } = require('../core/ballot-number')

class Storage {
  constructor () {
    this.promised = {}
    this.accepted = {}
    this.states = {}
  }

  prepare (key, ballot) {
    const promised = this.promised[key] || BallotNumber.zero()
    const accepted = this.accepted[key] || BallotNumber.zero()
    const candidate = BallotNumber.parse(ballot)

    if (candidate.compareTo(promised) <= 0) {
      return {
        status: 'fail',
        ballot: promised.stringify()
      }
    }
    if (candidate.compareTo(accepted) <= 0) {
      return {
        status: 'fail',
        ballot: accepted.stringify()
      }
    }

    this.promised[key] = candidate
    return {
      status: 'ok',
      ballot: accepted.stringify(),
      state: this.states[key]
    }
  }

  accept (key, ballot, state) {
    const promised = this.promised[key] || BallotNumber.zero()
    const accepted = this.accepted[key] || BallotNumber.zero()
    const candidate = BallotNumber.parse(ballot)

    if (candidate.compareTo(promised) < 0) {
      return {
        status: 'fail',
        ballot: promised.stringify()
      }
    }
    if (candidate.compareTo(accepted) <= 0) {
      return {
        status: 'fail',
        ballot: accepted.stringify()
      }
    }

    delete this.promised[key]
    this.accepted[key] = candidate
    this.states[key] = state
    return {
      status: 'ok'
    }
  }
}

module.exports = Storage
