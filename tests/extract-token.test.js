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
const {
  bodyBaseExtractor,
  queryBaseExtractor,
  headerBasePrefixedExtractor
} = extractToken.extractors

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
        body: bodyBaseExtractor(tokenKey)
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
        query: queryBaseExtractor(tokenKey)
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
        header: headerBasePrefixedExtractor({
          prefix: headerTokenPrefix,
          key: tokenKey
        })
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
        body: bodyBaseExtractor(bodyTokenKey),
        query: queryBaseExtractor(queryTokenKey)
      },
      to: reqKey
    }

    const errorAssertion = assertError(opts, reqKey, MultipleTokenError)
    return errorAssertion(req)
  })

  it('should throw when token was defined multiple times (query + header)', () => {
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
        query: queryBaseExtractor(queryTokenKey),
        header: headerBasePrefixedExtractor({
          key: headerTokenKey,
          prefix: headerPrefix
        })
      },
      to: reqKey
    }

    const errorAssertion = assertError(opts, reqKey, MultipleTokenError)
    return errorAssertion(req)
  })

  it('should throw when token was defined multiple times (query + body differents)', () => {
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
        query: queryBaseExtractor(queryTokenKey),
        body: bodyBaseExtractor(bodyTokenKey)
      },
      to: reqKey
    }

    const errorAssertion = assertError(opts, reqKey, MultipleTokenError)
    return errorAssertion(req)
  })

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
        body: bodyBaseExtractor(bodyTokenKey),
        query: queryBaseExtractor(queryTokenKey)
      },
      to: reqKey
    }

    const errorAssertion = assertError(opts, reqKey, MultipleTokenError)
    return errorAssertion(req)
  })

  it('should throw when token was defined multiple times (query + header)', () => {
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
        query: queryBaseExtractor(queryTokenKey),
        header: headerBasePrefixedExtractor({
          prefix: headerPrefix,
          key: headerTokenKey
        })
      },
      to: reqKey
    }

    const errorAssertion = assertError(opts, reqKey, MultipleTokenError)
    return errorAssertion(req)
  })

  it('should retrieve token when defined multiple times with multipleTolerant option', () => {
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
        body: bodyBaseExtractor(bodyTokenKey),
        query: queryBaseExtractor(queryTokenKey)
      },
      to: reqKey,
      multiTolerant: true
    }

    const assertion = assertOk(opts, reqKey, bodyTokenValue)
    return assertion(req)
  })

  it('should prioritize token from query when defined multiple times with multipleTolerant option', () => {
    const bodyTokenKey = 'foo'
    const queryTokenKey = 'access_token'
    const bodyTokenValue = 'bar'
    const queryTokenValue = 'baz'

    const reqKey = 'token'

    const req = {
      body: {
        [bodyTokenKey]: bodyTokenValue
      },
      query: {
        [queryTokenKey]: queryTokenValue
      }
    }

    const opts = {
      from: {
        query: queryBaseExtractor(queryTokenKey),
        body: bodyBaseExtractor(bodyTokenKey)
      },
      to: reqKey,
      multiTolerant: true
    }

    const assertion = assertOk(opts, reqKey, queryTokenValue)
    return assertion(req)
  })

  it('should prioritize token from body when defined multiple times with multipleTolerant option', () => {
    const bodyTokenKey = 'foo'
    const queryTokenKey = 'access_token'
    const headerTokenKey = 'authorization'
    const headerPrefix = 'Bearer '
    const bodyTokenValue = 'bar'
    const queryTokenValue = 'baz'
    const headerTokenValue = 'bat'

    const reqKey = 'token'

    const req = {
      headers: {
        [headerTokenKey]: `${headerPrefix}${headerTokenValue}`
      },
      body: {
        [bodyTokenKey]: bodyTokenValue
      },
      query: {
        [queryTokenKey]: queryTokenValue
      }
    }

    const opts = {
      from: {
        header: headerBasePrefixedExtractor({
          key: headerTokenKey,
          prefix: headerPrefix
        }),
        body: bodyBaseExtractor(bodyTokenKey),
        query: queryBaseExtractor(queryTokenKey)
      },
      to: reqKey,
      multiTolerant: true
    }

    const assertion = assertOk(opts, reqKey, headerTokenValue)
    return assertion(req)
  })
})
