# @permettezmoideconstruire/gml-to-geojson [![Build Status](https://secure.travis-ci.org/permettez-moi-de-construire/express-jwt.png)](http://travis-ci.org/permettez-moi-de-construire/express-jwt)
> Bearer token middleware for express.

[![NPM](https://nodei.co/npm/@permettezmoideconstruire/express-jwt.png)](https://nodei.co/npm/@permettezmoideconstruire/express-jwt/)

## What?

Per [RFC6750] this module will attempt to extract a bearer token from a request from these locations:

* The key `access_token` in the request body.
* The key `access_token` in the request params.
* The value from the header `Authorization: Bearer <token>`.

If a token is found, it will be stored on `req.token`.  If one has been provided in more than one location, this will abort the request immediately by sending code 400 (per [RFC6750]).

```js
const express = require('express');
const { extractToken } = require('@permettez-moi-de-construire/jwt-express');
const app = express();

app.use(extractToken());
app.use(function (req, res) {
  res.send('Token ' + req.token);
});
app.listen(8000);
```

For APIs which are not compliant with [RFC6750], the key for the token in each location is customizable, as is the key the token is bound to on the request (default configuration shown):
```js
app.use(bearerToken({
  bodyKey: 'access_token',
  queryKey: 'access_token',
  headerKey: 'Bearer',
  reqKey: 'token'
}));
```
As of version 2.2.0 we've added initial support for TypeScript. 

[RFC6750]: https://xml.resource.org/html/rfc6750
