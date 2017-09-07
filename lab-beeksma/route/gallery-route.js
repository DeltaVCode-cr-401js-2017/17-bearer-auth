'use strict';

const jsonParser = require('body-parser').json();
const debug = require('debug')('app:route/gallery-route');
const Router = require('express').Router;
const createError = require('http-errors');

const Gallery = require('../model/gallery');
const router = module.exports = new Router();

router.post('/api/gallery', jsonParser, (req,res,next) => {
  debug('POST /api/gallery');

  new Gallery({
    ...req.body,
    userID: req.user._id
  }).save()
    .then(gallery => res.json(gallery))
    .catch(next);
});


router.get('/api/gallery/:id', (req,res,next) =>{
  debug(`GET /api/gallery/${req.params.id}`);

  Gallery.findById(req.params.id)
    .then(gallery => {
      if (!gallery)
        return res.sendStatus(404);

      if (gallery.userID.toString() !== req.user._id.toString()) {
        debug(`permission denied for ${req.user._id} (owner: ${gallery.userID})`);
        return next(createError(401, 'permission denied'));
      }

      res.json(gallery);
    })
    .catch(next);
});


router.put('/api/gallery/:id', jsonParser, (req,res,next) =>{
  debug(`PUT /api/gallery/${req.params.id}`);

  Gallery.findById(req.params.id)
    .then(gallery => {
      if (!gallery)
        return res.sendStatus(404);

      if (gallery.userID.toString() !== req.user._id.toString()) {
        debug(`permission denied for ${req.user._id} (owner: ${gallery.userID})`);
        return next(createError(401, 'permission denied'));
      }
      if(Object.keys(req.body).length === 0) {
        return next(createError(400, 'Invalid or missing body'));
      }
      else {
        for (var prop in Gallery.schema.paths) {
          if ((prop !== '_id') && (prop !== '__v')) {
            if (req.body[prop] !== undefined) {
              gallery[prop] = req.body[prop];
            }
          }
        }
        gallery.save()
          .then(gallery => res.json(gallery));
      }
    })
    .catch(next);
});

router.delete('/api/gallery/:id', (req,res,next) => {
  debug(`PUT /api/gallery/${req.params.id}`);

  Gallery.findById(req.params.id)
    .then(gallery => {
      if (!gallery)
        return res.sendStatus(404);

      if (gallery.userID.toString() !== req.user._id.toString()) {
        debug(`permission denied for ${req.user._id} (owner: ${gallery.userID})`);
        return next(createError(401, 'permission denied'));
      }
      else{
        gallery.remove()
          .then(gallery => res.json(gallery));
      }
    })
    .catch(next);
});
