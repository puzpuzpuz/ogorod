'use strict'

const { ProposerError, InsufficientQuorumError } = require('./errors')

class Proposer {
  constructor (ballot, prepare, accept) {
    this.ballot = ballot
    this.prepare = prepare
    this.accept = accept
  }

  async change (key, update) {
    const [ballot, currValue] = await this.guessValue(key)

    let next = currValue
    let error = null
    try {
      next = update(currValue)
    } catch (e) {
      throw ProposerError.UpdateError(error)
    }

    await this.commitValue(key, ballot, next)
    return next
  }

  async guessValue (key) {
    const tick = this.ballot.inc()
    let ok = null
    try {
      [ok] = await waitFor(
        this.prepare.nodes.map(x => x.prepare(key, tick)),
        x => x.isPrepared,
        this.prepare.quorum
      )
    } catch (e) {
      if (e instanceof InsufficientQuorumError) {
        for (const x of e.all.filter(x => x.isConflict)) {
          this.ballot.fastforwardAfter(x.ballot)
        }
        throw ProposerError.PrepareError()
      } else {
        throw e
      }
    }

    const max = ok.reduce((acc, e) => {
      return acc.ballot.compareTo(e.ballot) < 0 ? e : acc
    }, ok[0])
    return [tick, max.value]
  }

  async commitValue (key, ballot, value) {
    let all = []
    try {
      [, all] = await waitFor(
        this.accept.nodes.map(x => x.accept(key, ballot, value)),
        x => x.isOk,
        this.accept.quorum
      )
    } catch (e) {
      if (e instanceof InsufficientQuorumError) {
        all = e.all
        throw ProposerError.CommitError()
      } else {
        throw e
      }
    } finally {
      for (const x of all.filter(x => x.isConflict)) {
        this.ballot.fastforwardAfter(x.ballot)
      }
    }
  }
}

function waitFor (promises, cond, count) {
  return new Promise((resolve, reject) => {
    const result = []
    const all = []
    let isResolved = false
    let failed = 0
    for (let promise of promises) {
      (async function () {
        let value = null
        let error = false
        try {
          value = await promise
          if (isResolved) return
          all.push(value)
          if (!cond(value)) error = true
        } catch (e) {
          if (isResolved) return
          error = true
        }
        if (error) {
          failed += 1
          if (promises.length - failed < count) {
            isResolved = true
            reject(new InsufficientQuorumError(all))
          }
        } else {
          result.push(value)
          if (result.length === count) {
            isResolved = true
            resolve([result, all])
          }
        }
      })()
    }
  })
}

exports.Proposer = Proposer
