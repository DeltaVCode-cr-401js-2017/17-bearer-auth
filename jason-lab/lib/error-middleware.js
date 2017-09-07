'use strict';

const createErrror = require('http-errors');
const debug = require('debug')('app:error-middleware');

module.exports = function (err, req, res, next) {
  debug('error-middleware');
  if (err.status){
    debug(err.message);
  }
  else if (err.name === 'ValidationError') {
    debug('user error', err.message);
    err = createErrror(400, err.message);
  }
  else if(err.name === 'CastError' && err.kind === 'ObjectId'){
    debug(err.message);
    err = createErrror(404, err.message);
  }
  else{
    debug('server error', err);
    err = createErrror(500, err.message);
  }
  res.status(err.status).send(err.message);
  return next();
};
