class JwtError extends Error {
  constructor(message) {
    super(message)

    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name

    // This clips the constructor invocation from the stack trace.
    // It's not absolutely essential, but it does make the stack trace a little nicer.
    Error.captureStackTrace(this, this.constructor)
  }
}

class MultipleTokenError extends JwtError {
  constructor(keys) {
    const message = `Found multiple tokens in req (${keys.join(', ')})`
    super(message)
  }
}

const flatLevel2SafeExtractor = baseFieldKey => paramKey => req => {
  return (req && req[baseFieldKey]) ? req[baseFieldKey][paramKey] : null
}

const bodyBaseExtractor = flatLevel2SafeExtractor('body')
const queryBaseExtractor = flatLevel2SafeExtractor('query')
const headerBasePrefixedExtractor = ({key, prefix}) => req => {
  if (!req || !req.headers || !req.headers[key]) {
    return null
  }

  if (
    typeof req.headers[key] !== 'string' || (
      prefix &&
      !req.headers[key].startsWith(prefix)
    )
  ) {
    return null
  }

  return req.headers[key].slice(prefix.length)
}

// That order defines priority when multiTolerant
const baseExtractors = {
  query: queryBaseExtractor,
  body: bodyBaseExtractor,
  header: headerBasePrefixedExtractor
}

const DEFAULT_QUERY_KEY = 'access_token'
const DEFAULT_HEADER_KEY = 'authorization'
const DEFAULT_HEADER_PREFIX = 'Bearer '

function extractTokenFactory(opts) {
  const defaultOps = {
    from: {
      query: queryBaseExtractor(DEFAULT_QUERY_KEY),
      // body: 'access_token',
      header: headerBasePrefixedExtractor({
        key: DEFAULT_HEADER_KEY,
        prefix: DEFAULT_HEADER_PREFIX
      })
    },
    to: 'token',
    multiTolerant: false
  }

  const parsedOps = {
    ...defaultOps,
    ...opts
  }

  const relevantExtractorsEntries = Object.entries(parsedOps.from)

  return function (req, res, next) {
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
}

extractTokenFactory.JwtError = JwtError
extractTokenFactory.MultipleTokenError = MultipleTokenError

extractTokenFactory.extractors = {
  bodyBaseExtractor,
  queryBaseExtractor,
  headerBasePrefixedExtractor
}

module.exports = extractTokenFactory
