const {
  describe,
  it
} = require('mocha')
const assert = require('chai').assert

const extractToken = require('../src/extract-token')
const {
  JwtError,
  MultipleTokenError
} = extractToken

describe('extractToken function', () => {
  const assertOk = (opts, reqKey, expectedVal) => req => {
    return new Promise((resolve, reject) => {
      extractToken(opts)(req, null, err => {
        assert.notExists(err)
        resolve()
      })
    })
      .then(() => {
        assert.equal(req[reqKey], expectedVal)
      })
  }

  it('should retrieve token from body when specified', () => {
    const tokenKey = 'foo'
    const tokenValue = 'bar'

    const reqKey = 'token'

    const req = {
      body: {
        [tokenKey]: tokenValue
      }
    }

    const opts = {
      from: {
        body: tokenKey
      },
      to: reqKey
    }

    const assertion = assertOk(opts, reqKey, tokenValue)
    return assertion(req)
  })

  it('should retrieve token from query when specified', () => {
    const tokenKey = 'foo'
    const tokenValue = 'bar'

    const reqKey = 'token'

    const req = {
      query: {
        [tokenKey]: tokenValue
      }
    }

    const opts = {
      from: {
        query: tokenKey
      },
      to: reqKey
    }

    const assertion = assertOk(opts, reqKey, tokenValue)
    return assertion(req)
  })

  it('should retrieve token from headers when specified', () => {
    const tokenKey = 'foo'
    const headerTokenPrefix = 'Cheeze '
    const tokenValue = 'bar'

    const reqKey = 'token'

    const req = {
      headers: {
        [tokenKey]: `${headerTokenPrefix}${tokenValue}`
      }
    }

    const opts = {
      from: {
        header: {
          prefix: headerTokenPrefix,
          key: tokenKey
        }
      },
      to: reqKey
    }

    const assertion = assertOk(opts, reqKey, tokenValue)
    return assertion(req)
  })

  it('should retrieve token from query when specified with default params', () => {
    const tokenKey = 'access_token'
    const tokenValue = 'bar'

    const reqKey = 'token'

    const req = {
      query: {
        [tokenKey]: tokenValue
      }
    }

    const opts = {
      to: reqKey
    }

    const assertion = assertOk(opts, reqKey, tokenValue)
    return assertion(req)
  })

  it('should retrieve token from headers when specified with default params', () => {
    const tokenKey = 'authorization'
    const headerTokenPrefix = 'Bearer '
    const tokenValue = 'bar'

    const reqKey = 'token'

    const req = {
      headers: {
        [tokenKey]: `${headerTokenPrefix}${tokenValue}`
      }
    }

    const opts = {
      to: reqKey
    }

    const assertion = assertOk(opts, reqKey, tokenValue)
    return assertion(req)
  })

  const assertError = (opts, type) => req => {
    return new Promise((resolve, reject) => {
      extractToken(opts)(req, null, err => {
        assert.exists(err)
        resolve(err)
      })
    })
      .then(err => {
        assert.instanceOf(err, type)
      })
  }

  it('should throw when token was defined multiple times', () => {
    const bodyTokenKey = 'foo'
    const queryTokenKey = 'fii'
    const tokenValue = 'bar'

    const reqKey = 'token'

    const req = {
      body: {
        [bodyTokenKey]: tokenValue
      },
      query: {
        [queryTokenKey]: tokenValue
      }
    }

    const opts = {
      from: {
        body: bodyTokenKey,
        query: queryTokenKey
      },
      to: reqKey
    }

    const errorAssertion = assertError(opts, MultipleTokenError)
    return errorAssertion(req)
  })
})
