'use strict';
const _ = require('lodash');
const request = require('request');
const urlJoin = require('url-join');
const urlPattern = require('url-pattern');


function authorization(options) {
  if (!options) {
    throw new Error('Options are missing.')
  }

  if (!options.validationUri) {
    throw new Error('validationUri option is missing.')
  }

  if (!options.tokenParam) {
    throw new Error('tokenParam option is missing.')
  }

  return function (req, res, next) {
    if (_.some(options.unprotected, (route) => {
        return new urlPattern(route).match(req._parsedUrl.pathname);
      })) {
      return next();
    }

    if (req.headers.authorization) {
      const tokens = req.headers.authorization.split(', ');
      const bearerTokenHeader = _.find(tokens, token => token.toLowerCase().startsWith('bearer'));
      let bearerToken = bearerTokenHeader.substr(7);
      let tokenParam = `?${options.tokenParam}=${bearerToken}`;
      var uri = urlJoin(options.validationUri, tokenParam);
      request(uri, function (err, validationResponse) {
        if (err) {
          // failed to get validation response
          return res.status(500).send();
        }
        if (validationResponse.statusCode === 200) {
          return next();
        }
        return res.status(401).send()
      });
    } else {
      return res.status(401).send();
    }
  }
}

module.exports = authorization;