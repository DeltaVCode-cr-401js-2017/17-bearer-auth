'use strict';

const jsonParser = require('body-parser').json();
const debug = require('debug')('app:route/gallery-route');
const Router = require('express').Router;
//const createError = require('http-errors');

const Gallery = require('../model/gallery');
const router = module.exports = new Router();

router.post('/api/gallery:id', jsonParser,  (req,res,next) => {
  debug('POST /api/gallery');

  new Gallery(req.body)
    .save()
    .then(gallery => res.json(gallery))
    .catch(next);
});

router.get('/api/gallery/:id', (req,res,next) =>{
  debug(`GET /api/gallery/${req.params.id}`);

  Gallery.findById(req.params.id)
    .then(gallery => gallery ? res.json(gallery) : res.send(404))
    .catch(next);
});
