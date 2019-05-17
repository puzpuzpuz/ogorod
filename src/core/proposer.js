'use strict'

const { ProposerError, InsufficientQuorumError } = require('./errors')

class Proposer {
  constructor (ballot, acceptors) {
    this.ballot = ballot
    this.acceptors = acceptors
  }

  async change (key, update) {
    const [ballot, currState] = await this.guessState(key)

    let next = currState
    let error = null
    try {
      next = update(currState)
    } catch (e) {
      throw ProposerError.UpdateError(error)
    }

    await this.commitState(key, ballot, next)
    return next
  }

  async guessState (key) {
    const tick = this.ballot.inc()
    let ok = null
    try {
      [ok] = await waitFor(
        this.acceptors.nodes.map(x => x.prepare(key, tick)),
        x => x.isPrepared,
        this.acceptors.quorum
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
    return [tick, max.state]
  }

  async commitState (key, ballot, state) {
    let all = []
    try {
      [, all] = await waitFor(
        this.acceptors.nodes.map(x => x.accept(key, ballot, state)),
        x => x.isOk,
        this.acceptors.quorum
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

async function waitFor (promises, cond, count) {
  const results = []
  const replies = []
  let isResolved = false
  let failed = 0

  function handleError (reject) {
    failed += 1
    if (promises.length - failed < count) {
      isResolved = true
      reject(new InsufficientQuorumError(replies))
    }
  }

  return new Promise((resolve, reject) => {
    for (const promise of promises) {
      promise
        .then(res => {
          if (isResolved) return
          replies.push(res)
          if (!cond(res)) {
            return handleError(reject)
          }

          results.push(res)
          if (results.length === count) {
            isResolved = true
            resolve([results, replies])
          }
        })
        .catch(_ => {
          if (isResolved) return
          handleError(reject)
        })
    }
  })
}

exports.Proposer = Proposer
