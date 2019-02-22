const {
  queryBaseExtractor,
  bodyBaseExtractor,
  headerBasePrefixedExtractor
} = require('./util/extractors')

const {
  MultipleTokenError
} = require('./util/errors')

const DEFAULT_QUERY_KEY = 'access_token'
const DEFAULT_HEADER_KEY = 'authorization'
const DEFAULT_HEADER_PREFIX = 'Bearer '
const DEFAULT_REQ_KEY = 'token'

function extractTokenFactory(opts = {}) {
  const defaultOpts = {
    from: {
      query: queryBaseExtractor(DEFAULT_QUERY_KEY),
      // body: 'access_token',
      header: headerBasePrefixedExtractor({
        key: DEFAULT_HEADER_KEY,
        prefix: DEFAULT_HEADER_PREFIX
      })
    },
    to: DEFAULT_REQ_KEY,
    multiTolerant: false
  }

  const parsedOps = {
    ...defaultOpts,
    ...opts
  }

  const relevantExtractorsEntries = Object.entries(parsedOps.from)

  const extractTokenMiddleware = (req, res, next) => {
    try {
      const foundTokens = relevantExtractorsEntries
        .map(([key, extractor]) => [key, extractor(req)])
        .filter(([key, token]) => !!token)

      if (!parsedOps.multiTolerant && foundTokens.length > 1) {
        throw new MultipleTokenError(foundTokens.map(([key, extractor]) => key))
      }

      const foundToken = (foundTokens.length !== 0) ? foundTokens[0][1] : null

      req[parsedOps.to] = foundToken
      next()
    } catch (err) {
      next(err)
    }
  }

  return extractTokenMiddleware
}

module.exports = extractTokenFactory
