# @permettez-moi-de-construire/express-jwt

[![Build Status](https://img.shields.io/travis/permettez-moi-de-construire/express-jwt.svg)](http://travis-ci.org/permettez-moi-de-construire/express-jwt) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) ![Code Size](https://img.shields.io/github/languages/code-size/permettez-moi-de-construire/express-jwt.svg) [![Dependencies Status](https://img.shields.io/librariesio/github/permettez-moi-de-construire/express-jwt.svg)](https://libraries.io/github/permettez-moi-de-construire/express-jwt)

> Jwt helper middlewares for express.

[![NPM](https://nodei.co/npm/@permettezmoideconstruire/express-jwt.svg)](https://nodei.co/npm/@permettezmoideconstruire/express-jwt/)

```
npm install --save @permettezmoideconstruire/express-jwt
```

## API

```
const {
  extractToken,
  verifyToken
} = require('@permettezmoideconstruire/express-jwt')
```

### `extractToken([options])`

`extractToken` is a middleware factory.

Per [RFC6750] the returned middleware will attempt to extract a bearer token from a request from these locations:

* The key `access_token` in the request body.
* The key `access_token` in the request params.
* The value from the header `Authorization: Bearer <token>`.

If a token is found, it will be stored on `req.token`. If one has been provided in more than one location, this will immediately call `next` with a `MultipleTokenError` (per [RFC6750]).

For APIs not [RFC6750] compliant, see options :

#### Syntax

```
const express = require('express')
const { extractToken } = require('@permettezmoideconstruire/express-jwt')

const app = express()
app.use(extractToken())
app.use(function(req, res) {
  console.log(req.token)
  res.send()
})

app.use(process.env.PORT)
```

#### API

- `return` _function_ : Returns the middleware

- `options.from` _Object\{key: function(req) => string\}_
  - An associative array (object) of *extractors*. An extractor is a function that takes a single `req` parameter and returns a string
  - default:
    ```
    {
      query: queryBaseExtractor('access_token'),
      body: bodyBaseExtractor('access_token'),
      header: headerBasePrefixedExtractor({
        key: 'authorization',
        prefix: 'Bearer '
      })
    }
    ```

- `options.to` _string_
  - A string which is the key to place token inside `req` (for example `{ to: 'token' }` will set `req.token`)
  - default: `'token'`

- `options.multiTolerant` _bool_
  - A boolean which switches the behavior from a "throw when token found in multiple place" strategy to a "take first found token" strategy.
  - The concept of "first" follows the order of the keys inside `options.from`
  - default: `false`


[RFC6750]: https://xml.resource.org/html/rfc6750

### `verifyToken(secretOrPrivateKey, [options])`

`verifyToken` is a middleware factory.

The returned middleware verifies the token inside `req.token` and decodes it to `req.token` (transforms it actualy)

If you want to keep encoded token inside `req`, or simply change input or output key, see options.

#### Syntax

```
const express = require('express')
const { extractToken, verifyToken } = require('@permettezmoideconstruire/express-jwt')

const app = express()
app.use(
  extractToken(),
  verifyToken(process.env.JWT_SECRET_KEY)
)
app.use(function(req, res) {
  console.log(req.token)
  res.send()
})

app.use(process.env.PORT)
```

#### API

- `return` _function_ : Returns the middleware

- `secretOrPrivateKey` _mixed_
  - The key that encoded the token, and should be used to decode it
  - See [auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback](https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback)

- `options.from` _function(req) => string_
  - A function that is an extractor. An extractor is a function that takes a single `req` parameter and returns a string
  - default: `reqBaseExtractor('token')`

- `options.to` _string_
  - A string which is the key to place token inside `req` (for example `{ to: 'token' }` will set `req.token`)
  - default: `'token'`

- `options.jwt` _object_
  - An object that represents _jwt_ options for `verify` method (this is passed down)
  - See [auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback](https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback)
