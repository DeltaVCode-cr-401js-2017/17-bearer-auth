'use strict';

const createError = require('http-errors');
const debug = require('debug')('app:error-middleware');

module.exports = function(err,req,res,next){
  debug('error-middleware');

  if (err.status){
    debug(err.message);
  }
  else if (err.name === 'ValidationError'){
    err = createError(400, err.message);
  }
  else if (err.name === 'TypeError'){
    err = createError(401,err.message);
  }
  else {
    console.error('This is the Last stop for catching errors',err);
    err = createError(500, err.message);
  }

  res.status(err.status).send(err.name);
  return next();
};
