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
        assert.propertyVal(req, reqKey, expectedVal)
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

  it('should retrieve token from query "access_token" when specified with default params', () => {
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

  it('should retrieve token from "authorization: Bearer XXXXX" headers when specified with default params', () => {
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

  it('should set the token inside req.token with default params', () => {
    const tokenKey = 'access_token'
    const tokenValue = 'bar'

    const reqKey = 'token'

    const req = {
      query: {
        [tokenKey]: tokenValue
      }
    }

    const opts = null

    const assertion = assertOk(opts, reqKey, tokenValue)
    return assertion(req)
  })

  const assertError = (opts, reqKey, type) => req => {
    return new Promise((resolve, reject) => {
      extractToken(opts)(req, null, err => {
        try {
          assert.exists(err)
          assert.instanceOf(err, type)
          assert.notProperty(req, reqKey)
          resolve()
        } catch(err) {
          reject(err)
        }
      })
    })
  }

  it('should throw when token was defined multiple times (body + query)', () => {
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

    const errorAssertion = assertError(opts, reqKey, MultipleTokenError)
    return errorAssertion(req)
  })

  it('should throw when token was defined multiple times (query + header implicit)', () => {
    const headerTokenKey = 'authorization'
    const headerPrefix = 'Bearer '
    const queryTokenKey = 'fii'
    const tokenValue = 'bar'

    const reqKey = 'token'

    const req = {
      query: {
        [queryTokenKey]: tokenValue
      },
      headers: {
        [headerTokenKey]: `${headerPrefix}${tokenValue}`
      }
    }

    const opts = {
      from: {
        query: queryTokenKey
      },
      to: reqKey
    }

    const errorAssertion = assertError(opts, reqKey, MultipleTokenError)
    return errorAssertion(req)
  })

  it('should throw when token was defined multiple times (query implicit + body differents)', () => {
    const bodyTokenKey = 'foo'
    const queryTokenKey = 'access_token'
    const bodyTokenValue = 'bar'
    const queryTokenValue = 'baz'

    const reqKey = 'token'

    const req = {
      query: {
        [queryTokenKey]: queryTokenValue
      },
      body: {
        [bodyTokenKey]: bodyTokenValue
      }
    }

    const opts = {
      from: {
        body: bodyTokenKey
      },
      to: reqKey
    }

    const errorAssertion = assertError(opts, reqKey, MultipleTokenError)
    return errorAssertion(req)
  })
})
