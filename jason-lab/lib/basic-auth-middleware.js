'use-strict';

const debug = require('debug')('app:basic-auth-middleware');
const createError = require('http-errors');

module.exports = function (req, res, next){
  debug('auth');

  let authHeader = req.headers.authorization;
  if (!authHeader){
    return next(createError(401, 'auth header is required'));
  }
  let base64str = authHeader.split('Basic ')[1];
  if (!base64str){
    return next(createError(401, 'username and password required'));
  }
  var utf8str = new Buffer(base64str, 'base64').toString();
  var [username, password] = utf8str.split(':', 2);

  req.auth = { username, password };

  if (!req.auth.username){
    return next(createError(401, 'username required'));
  }
  if (!req.auth.password){
    return next(createError(401, 'password required'));
  }

  next();
};
