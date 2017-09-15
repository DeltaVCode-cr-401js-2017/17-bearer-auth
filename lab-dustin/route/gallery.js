'use strict';

const Router = require('express');
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('app:route/gallery');
const Gallery = require('../model/gallery');
const bearerAuth = require('../lib/bearer-auth-middleware');

const router = module.exports = new Router();

router.get('/api/gallery/:id',bearerAuth,(req,res,next) => {
  debug(`GET /api/gallery/${req.params.id}`);

  Gallery.findById(req.params.id)
    .then(gallery => {
      if (!gallery) {
        debug('Gallery not found');
        return next(createError(404,'Gallery not found'));
      }

      debug('user', req.user);
      debug('gallery', gallery);
      if (req.user._id.toString() !== gallery.userID.toString()){
        debug('Permission denied');
        return res.sendStatus(401,'permission denied');
      }
      res.json(gallery);
    })
    .catch(function(err){
      debug(err.message);
      next();
    });
});

router.post('/api/gallery',jsonParser,(req,res,next) => {
  debug(`POST /api/gallery/${req.params.id}`);

  new Gallery({
    ...req.body,
    userID: req.user._id
  }).save()
    .then(gallery => res.json(gallery))
    .catch(next);
});

router.put('/api/gallery/:id',jsonParser,(req,res,next) => {
  debug(`PUT /api/gallery/${req.params.id}`);
  debug('verified user ',req.user);
/*
  if (req.user._id !== req.params.id){
    return next(createError(404,'user does not match'));
  }
*/
  if (req.body.userID){
    debug('USER_ID',req.body.userID);
    return next(createError(400,'Cannot set new ID'));
  }

  Gallery.findByIdAndUpdate(req.params.id,req.body,{ new: true })
    .then(gallery => {
      debug('Gallery ',gallery);
      if (gallery === null)
        return Promise.reject(createError(404));
      return res.json(gallery);
    })
    .catch(err => {
      debug('Error!',err.message);
      next(err);
    });
});
