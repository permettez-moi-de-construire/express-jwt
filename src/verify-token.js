const jwt = require('jsonwebtoken')
const util = require('util')

const {
  reqBaseExtractor
} = require('./util/extractors')

const {
  InvalidTokenError
} = require('./util/errors')

const DEFAULT_REQ_KEY = 'token'
const DEFAULT_OUT_REQ_KEY = 'token'

const verifyAsPromise = util.promisify(jwt.verify)

function checkTokenFactory (secretOrPublicKey, opts = { }) {
  const defaultOpts = {
    from: reqBaseExtractor(DEFAULT_REQ_KEY),
    to: DEFAULT_OUT_REQ_KEY,
    jwt: {

    }
  }

  const parsedOpts = {
    ...defaultOpts,
    ...opts,
    jwt: {
      ...defaultOpts.jwt,
      ...opts.jwt
    }
  }

  const checkTokenMiddleware = async (req, res, next) => {
    try {
      // Retrieve token
      const token = parsedOpts.from(req)

      // Verify and decode it
      const decodedToken = await verifyAsPromise(token, secretOrPublicKey, parsedOpts.jwt)

      req[parsedOpts.to] = decodedToken
      next()
    } catch (err) {
      next(err)
    }
  }

  return checkTokenMiddleware
}

module.exports = checkTokenFactory
