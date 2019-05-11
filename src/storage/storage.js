'use strict'

const { BallotNumber } = require('../core/ballot-number')

class Storage {
  constructor () {
    this.promised = {}
    this.accepted = {}
    this.values = {}
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
      value: this.values[key]
    }
  }

  accept (key, ballot, value, nextBallot) {
    const promised = this.promised[key] || BallotNumber.zero()
    const accepted = this.accepted[key] || BallotNumber.zero()
    const candidate = BallotNumber.parse(ballot)
    const nextCandidate = BallotNumber.parse(nextBallot)

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

    this.promised[key] = nextCandidate
    this.accepted[key] = candidate
    this.values[key] = value
    return {
      status: 'ok'
    }
  }
}

module.exports = Storage
