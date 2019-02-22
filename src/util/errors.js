const {
  JsonWebTokenError
} = require('jsonwebtoken')

class MultipleTokenError extends JsonWebTokenError {
  constructor(keys) {
    const message = `Found multiple tokens in req (${keys.join(', ')})`
    super(message)
  }
}

class InvalidTokenError extends JsonWebTokenError {
  constructor(token) {
    const message = `Invalid token ${token}`
    super(message)
  }
}

module.exports = {
  MultipleTokenError,
  InvalidTokenError
}