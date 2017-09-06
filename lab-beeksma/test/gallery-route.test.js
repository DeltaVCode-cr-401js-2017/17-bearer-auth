'use strict';

const app = require('../server');
const request = require('supertest')(app);
const debug = require('debug')('app:test/gallery-route');
const User = require('../model/user');
const Gallery = require('../model/gallery');
require('../lib/mongoose-connect');
const { expect } = require('chai');

const exampleUser = {
  username: 'example'
  ,password: 'password!'
  ,email: 'example@example.com'
};

const exampleGallery = {
  name: 'test gallery'
  ,desc: 'some stuff goes here'
};

describe('Gallery Routes', function (){
  afterEach(function (){
    return Promise.all([
      User.remove({})
      ,Gallery.remove({})
    ]);
  });
  describe('POST /api/gallery', function (){
    xit('should return a gallery',function() {
      return request
        .post('/api/gallery')
        .send(exampleGallery)
        .expect(200)
        .expect(res => {
          expect(res.bosy.name).to.equal(exampleGallery.name);
          expect(res.bosy.created).to.not.be.undefined;
        });
    });

  });
  describe('GET /api/gallery/:id', function (){
    describe('missing id', function(){
      it('should return 404', function (){
        return request
          .get('/api/gallery/noID')
          .expect(404);
      });
    });
    describe('invalid id', function(){
      it('should return 404', function (){
        return request
          .get('/api/gallery/deadbeefdeadbeefdeadbeef')
          .expect(404);
      });
    });
    describe('valid id', function(){
      before(function(){
        return new User(exampleUser)
          .generatePasswordHash(exampleUser.password)
          .then(user => user.save())
          .then(user => this.testUser = user);
      });
      before(function (){
        return new Gallery({...exampleGallery,userID: this.testUser._id.toString()})
          .save()
          .then(gallery => this.testGallery = gallery);
      });
      it('should return a gallery', function (){
        return request
          .get(`/api/gallery/${this.testGallery.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.name).to.equal(exampleGallery.name);
            expect(res.body.created).to.not.be.undefined;
            expect(res.body).to.have.property('desc', exampleGallery.desc);
          });
      });
    });
  });
});
