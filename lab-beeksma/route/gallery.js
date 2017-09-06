'use strict';

const jsonParser = require('body-parser').json();
const debug = require('debug')('app:route/gallery');
const Router = require('express').Router;
const createError = require('http-errors');

const router = module.exports = new Router();

router.get('/api/gallery/:id', (req,res,next) =>{
  debug(`GET /api/gallery/${req.params.id}`);
  res.json({_id: req.params.id});
})
