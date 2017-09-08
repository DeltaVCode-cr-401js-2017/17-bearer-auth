'use strict';

const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const debug = require('debug')('app:model/gallery');

const gallerySchema = Schema({
  name: { type: String, required: true },
  desc: { type: String, required: true },
  created: { type: Date, required: true, default: Date.now },
  userID: { type: Schema.Types.ObjectId, required: true }
});

const Gallery = module.exports = mongoose.models.gallery || mongoose.model('gallery',gallerySchema);

Gallery.createGallery = function(body,user_id){
  debug(body);
  debug(user_id);
  return new Gallery({
    name: body.name,
    desc: body.desc,
    userID: user_id
  }).save();
};
