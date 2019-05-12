'use strict'

const axios = require('axios')

class AcceptorClient {
  constructor (address, parseBallotNumber) {
    this.parseBallotNumber = parseBallotNumber
    this.address = address
  }

  async prepare (key, ballot) {
    try {
      const resp = await axios.post(`http://${this.address}/internal-api/prepare`, {
        key,
        ballot: ballot.stringify()
      })

      const acceptedBallot = this.parseBallotNumber(resp.data.ballot)
      if (resp.data.status === 'ok') {
        const acceptedValue = acceptedBallot.isZero() ? null : resp.data.value
        return { isPrepared: true, ballot: acceptedBallot, value: acceptedValue }
      } else {
        return { isConflict: true, ballot: acceptedBallot }
      }
    } catch (e) {
      return { isError: true }
    }
  }

  async accept (key, ballot, value) {
    try {
      const resp = await axios.post(`http://${this.address}/internal-api/accept`, {
        key,
        ballot: ballot.stringify(),
        value
      })

      if (resp.data.status === 'ok') {
        return { isOk: true }
      } else {
        return { isConflict: true, ballot: this.parseBallotNumber(resp.data.ballot) }
      }
    } catch (e) {
      return { isError: true }
    }
  }
}

module.exports = AcceptorClient
