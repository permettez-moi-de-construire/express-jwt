const {
  describe,
  it
} = require('mocha')
const assert = require('chai').assert

const { sign } = require('jsonwebtoken')

const {
  verifyToken,
  util: {
    errors: {
      InvalidTokenError
    },
    extractors: {
      reqBaseExtractor
    }
  }
} = require('../index')

describe('verifyToken function', () => {
  const payloadTokenValue = 'bar'
  const payloadTokenSecret = 'bar'
  let payloadToken

  beforeEach(() => {
    payloadToken = sign(payloadTokenValue, payloadTokenSecret)
  })

  const assertOk = (secretOrPublicKey, opts, outKey, expectedVal) => req => {
    return new Promise((resolve, reject) => {
      verifyToken(secretOrPublicKey, opts)(req, null, err => {
        if (err) {
          return reject(err)
        }
        try {
          assert.propertyVal(req, outKey, expectedVal)
          resolve()
        } catch (assertErr) {
          reject(assertErr)
        }
      })
    })
  }

  it('should verify token and decode it to req.token', () => {
    const reqKey = 'tok'
    const outKey = 'dec_tok'

    const req = {
      [reqKey]: payloadToken
    }

    const opts = {
      from: reqBaseExtractor(reqKey),
      to: outKey
    }

    const assertion = assertOk(
      payloadTokenSecret,
      opts,
      outKey,
      payloadTokenValue
    )
    return assertion(req)
  })

  afterEach(() => {
    payloadToken = null
  })
})
