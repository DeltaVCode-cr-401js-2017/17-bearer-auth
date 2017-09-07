'use strict';

const createError = require('http-errors');
const debug = require('debug')('app:error-middleware');

module.exports = function (err,req,res,next){
  debug('error-middleware');

  if(err.status){
    debug('user error', err.message);
  }
  else if(err.name === 'ValidationError'){
    debug('validation', err.message);
    err = createError(400, err.message);
  }
  else if(err.name === 'CastError' && err.kind === 'ObjectId'){
    debug('CastError', err.message);
    err = createError(404, err.message);
  }
  else{
    debug('server error');
    console.error(err);
    err = createError(500, err.message);
  }

  res.status(err.status).send(err.name);
  return next();
};
