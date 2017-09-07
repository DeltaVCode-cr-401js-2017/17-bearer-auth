'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('app:route/gallery');

const Gallery = require('../model/gallery');
const router = module.exports = new Router();

router.post('/api/gallery', jsonParser, (req, res, next) => {
  debug('POST /api/gallery');

  new Gallery({
    ...req.body,
    userID: req.user._id
  }).save()
    .then(gallery => res.json(gallery))
    .catch(next);
});

router.get('/api/gallery/:id', (req, res, next) => {
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
router.put('/api/gallery/:id', jsonParser, function(req, res, next){
  debug(`PUT: /api/gallery/${req.params.id}`);
  Gallery.findByIdAndUpdate(req.params.id, req.body, {new:true})
    .then(gallery => {
      if(Object.keys(req.body).length === 0) {
        return next(createError(400, 'Invalid or missing body'));
      }
      res.json(gallery);
    })
    .catch(next);
});
router.delete('/api/gallery/:id', function(req, res, next){
  debug('DELETE: /gallery/gallery/');

  Gallery.findById(req.params.id)
    .then((gallery) => {
      if (gallery.userID.toString() !== req.user._id.toString()) {
        debug(`permission denied for ${req.user._id} (owner: ${gallery.userID})`);
        return next(createError(401, 'permission denied'));
      }
      if(!gallery){
        return res.sendStatus(404);
      }
      else{
        gallery.remove()
          .then(() => res.sendStatus(204));
      }
    })
    .catch(err => next(err));
});
