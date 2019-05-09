'use strict'

class ProposerError extends Error {
  static ConcurrentRequestError () {
    return new ProposerError('ConcurrentRequestError')
  }

  static PrepareError () {
    return new ProposerError('PrepareError')
  }

  static CommitError () {
    return new ProposerError('CommitError')
  }

  static UpdateError (err) {
    const error = new ProposerError('UpdateError')
    error.err = err
    return error
  }

  constructor (code, ...args) {
    super(...args)
    this.code = code
    Error.captureStackTrace(this, ProposerError)
  }
}

class InsufficientQuorumError extends Error {
  constructor (all, ...args) {
    super(...args)
    this.all = all
    Error.captureStackTrace(this, InsufficientQuorumError)
  }
}

exports.ProposerError = ProposerError
exports.InsufficientQuorumError = InsufficientQuorumError
