'use strict'

/**
 * Wraps an async middleware (function) into a middleware with automatic error handling.
 * @param fn async middleware (function)
 * @returns {Function} wrapped middleware
 */
function asyncMiddleware (fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next)
  }
}

module.exports = {
  asyncMiddleware,
}
