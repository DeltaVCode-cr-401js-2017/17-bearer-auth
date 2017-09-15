'use strict';

const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const debug = require('debug')('app:bearer-auth-middleware');

const User = require('../model/user');

module.exports = function(req,res,next){
  debug('bearer');

  var authHeader = req.headers.authorization;
  if (!authHeader) return next(createError(401,'Authorization Header required'));

  var token = authHeader.split('Bearer ')[1];
  if (!token) return next(createError(401,'Auth Token required'));

  jwt.verify(token,process.env.APP_SECRET,(err,decoded) => {
    if (err) return next(err);
    debug('decoded: ', decoded);

    User.findOne({ findHash: decoded.token })
      .then(user => {
        req.user = user;
        next();
      })
      .catch(err => {
        next(createError(401,err.message));
      });
  });
};
