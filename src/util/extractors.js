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

const reqBaseExtractor = key => req => {
  if (!req) {
    return null
  }

  return req[key]
}

module.exports = {
  flatLevel2SafeExtractor,
  bodyBaseExtractor,
  queryBaseExtractor,
  headerBasePrefixedExtractor,
  reqBaseExtractor
}
