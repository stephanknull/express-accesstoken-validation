# express-accesstoken-validation
ExpressJS middleware for remote access token validation

Although JWT have become common use in OAuth 2.0 / OpenId Connect scenarios, there a scenarios where you as an resource server (=API) have to validate an access token received by the client.    
This validation normally is delegated to the OAuth 2.0 server which created that access token.

```express-accesstoken-validation``` is an ExpressJS middleware that lets you delegate the access token validation to an OAuth 2.0 server like [oauth2-server](https://www.npmjs.com/package/oauth2-server).

## Installation

```
npm install express-accesstoken-validation --save
```

## API

```JavaScript
const bearerTokenValidation = require('express-accesstoken-validation');

let options = {
  validationUri: 'https://localhost:3000/oauth/tokenvalidation',
  tokenParam: 'token',
  unprotected: ['/public']
}

app.use(bearerTokenValidation(options));
```

```options``` provides this options:

* ```validationUri```: The access token validation uri of the OAuth 2.0 server
* ```tokenParam```: The name of the token query parameter expected by the OAuth 2.0 server
* ```unprotected```: optional, a list of routes that should not be protected

Make sure to register ```express-accesstoken-validation``` as the first middleware to ensure all requests get authorized.

## Running the tests
```
npm test
```


