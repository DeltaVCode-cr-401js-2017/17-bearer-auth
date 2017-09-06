'use strict';

const Router = require('express');
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('app:route/gallery');

const router = module.exports = new Router();

router.get('/api/gallery/:id',(req,res,next) => {
  debug(`GET /api/gallery/${req.params.id}`);

  res.json({ id: req.params.id });// replace with:
  //TODO: Gallery.findById
});

//TODO: router.post
