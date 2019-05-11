'use strict'

const { ProposerError, InsufficientQuorumError } = require('./errors')

class Proposer {
  constructor (ballot, prepare, accept) {
    this.ballot = ballot

    this.prepare = prepare
    this.accept = accept

    this.cache = new Map()
    this.locks = new Set()
  }

  async change (key, update) {
    if (!this.tryLock(key)) {
      throw ProposerError.ConcurrentRequestError()
    }
    try {
      const [ballot, curr] = await this.guessValue(key)

      let next = curr
      let error = null
      try {
        next = update(curr)
      } catch (e) {
        error = e
      }

      const promise = ballot.next()
      await this.commitValue(key, ballot, next, promise)

      this.cache.set(key, [promise, next])
      if (error != null) {
        throw ProposerError.UpdateError(error)
      }

      return next
    } finally {
      this.unlock(key)
    }
  }

  async guessValue (key) {
    if (!this.cache.has(key)) {
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
      const value = max(ok, x => x.ballot).value
      this.cache.set(key, [tick, value])
    }
    return this.cache.get(key)
  }

  async commitValue (key, ballot, value, promise) {
    let all = []

    try {
      [, all] = await waitFor(
        this.accept.nodes.map(x => x.accept(key, ballot, value, promise)),
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
        this.cache.delete(key)
        this.ballot.fastforwardAfter(x.ballot)
      }
    }
  }

  tryLock (key) {
    if (this.locks.has(key)) {
      return false
    }
    this.locks.add(key)
    return true
  }

  unlock (key) {
    this.locks.delete(key)
  }
}

function max (iterable, selector) {
  return iterable.reduce((acc, e) => {
    return selector(acc).compareTo(selector(e)) < 0 ? e : acc
  }, iterable[0])
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
