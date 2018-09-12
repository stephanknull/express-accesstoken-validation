'use strict';
const assert = require('assert');
const bearerTokenValidation = require('../');
const express = require('express');
let server;
let statusCode;

describe('Access Token validation', function () {

  beforeEach(startOAuthServer);


  describe('When options are missing', function () {
    it('should return an error', function (done) {
      try {
        bearerTokenValidation();
      }
      catch(err) {
        assert.equal('Error: Options are missing.', err.toString());
        done();
      }
    });
  });

  describe('When validationUri option is missing', function () {
    it('should return an error', function (done) {
      try {
        bearerTokenValidation({ tokenParam: 'token' });
      }
      catch(err) {
        assert.equal('Error: validationUri option is missing.', err.toString());
        done();
      }
    });
  });

  describe('When tokenParam option is missing', function () {
    it('should return an error', function (done) {
      try {
        bearerTokenValidation({ validationUri: 'http://localhost:3000/oauth/tokenvalidation' });
      }
      catch(err) {
        assert.equal('Error: tokenParam option is missing.', err.toString());
        done();
      }
    });
  });

  describe('When validating a valid token', function () {
    it('should call next middleware (=allow access)', function (done) {
      bearerTokenValidation({
        validationUri: 'http://localhost:3000/oauth/tokenvalidation',
        tokenParam: 'token'
      })({
        headers: {
          'authorization': 'bearer token'
        },
        url: '/protected'
      }, {
        status: function (number) {
          return {
            send: function () {
              statusCode = number;
            }
          }
        }
      }, function (err) {
        assert.equal(err, null);
        done();
      });
    });
  });

  describe('When calling an unprotected URI', function () {
    it('should call next middleware (=allow access)', function (done) {
      bearerTokenValidation({
        validationUri: 'http://localhost:3000/oauth/tokenvalidation',
        tokenParam: 'token',
        unprotected: ['/public', '/public/api']
      })({
        headers: {},
        url: '/public',
        _parsedUrl:  { pathname: '/public' }
      }, {
        status: function (number) {
          return {
            send: function () {
              statusCode = number;
            }
          }
        }
      }, function (err) {
        assert.equal(err, null);
        done();
      });
    });
  });

  describe('When calling an unprotected URI with query params', function () {
    it('should call next middleware (=allow access)', function (done) {
      bearerTokenValidation({
        validationUri: 'http://localhost:3000/oauth/tokenvalidation',
        tokenParam: 'token',
        unprotected: ['/public', '/public/api']
      })({
        headers: {},
        url: '/public?id=1',
        _parsedUrl:  { pathname: '/public' }
      }, {
        status: function (number) {
          return {
            send: function () {
              statusCode = number;
            }
          }
        }
      }, function (err) {
        assert.equal(err, null);
        done();
      });
    });
  });

  describe('When calling an unprotected URI with url-params', function () {
    it('should call next middleware (=allow access)', function (done) {
      bearerTokenValidation({
        validationUri: 'http://localhost:3000/oauth/tokenvalidation',
        tokenParam: 'token',
        unprotected: ['/public/:id', '/public/api']
      })({
        headers: {},
        url: '/public/0815',
        _parsedUrl:  { pathname: '/public/0815' }
      }, {
        status: function (number) {
          return {
            send: function () {
              statusCode = number;
            }
          }
        }
      }, function (err) {
        assert.equal(err, null);
        done();
      });
    });
  });

  describe('When calling an unprotected URI with query params & url-params', function () {
    it('should call next middleware (=allow access)', function (done) {
      bearerTokenValidation({
        validationUri: 'http://localhost:3000/oauth/tokenvalidation',
        tokenParam: 'token',
        unprotected: ['/public/:id', '/public/api']
      })({
        headers: {},
        url: '/public/0815?id=1',
        _parsedUrl:  { pathname: '/public/0815' }
      }, {
        status: function (number) {
          return {
            send: function () {
              statusCode = number;
            }
          }
        }
      }, function (err) {
        assert.equal(err, null);
        done();
      });
    });
  });

  describe('When validating an invalid token', function () {
    it('should return status code 401 ', function (done) {
      bearerTokenValidation({
        validationUri: 'http://localhost:3000/oauth/tokenvalidation',
        tokenParam: 'token'
      })({
        headers: {
          'authorization': 'bearer invalid-token'
        }
      }, {
        status: function (number) {
          return {
            send: function () {
              assert.equal(number, 401);
              done();
            }
          };
        }
      });
    });
  });

  describe('With multiple tokens', function () {
    it('should select the correct and call next middleware (=allow access)', function (done) {
      bearerTokenValidation({
        validationUri: 'http://localhost:3000/oauth/tokenvalidation',
        tokenParam: 'token'
      })({
        headers: {
          'authorization': 'bearer token, policy policytoken'
        },
        url: '/protected'
      }, {
        status: function (number) {
          return {
            send: function () {
              statusCode = number;
            }
          }
        }
      }, function (err) {
        assert.equal(err, null);
        done();
      });
    });
  });

  describe('When authorization header is missing', function () {
    it('should return status code 401', function (done) {
      bearerTokenValidation({
        validationUri: 'http://localhost:3000/oauth/tokenvalidation',
        tokenParam: 'token'
      })({
        headers: {}
      }, {
        status: function (number) {
          return {
            send: function () {
              assert.equal(number, 401);
              done();
            }
          };
        }
      });
    });
  });

  afterEach(stopTestServer)
});

function startOAuthServer(done) {
  let app = express();
  app.get('/oauth/tokenvalidation', (req, res) => {
    if (req.query.token === 'token') {
      res.status(200).send();
    } else {
      res.status(400).send();
    }
  });
  server = app.listen(3000, function () {
    done();
  });
}

function stopTestServer(done) {
  server.close();
  done();
}