'use strict';

const app = require('../server');
const request = require('supertest')(app);
//const debug = require('debug')('app:test/gallery-route');
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
  beforeEach(function () {
    return User.createUser(exampleUser)
      .then(user => this.testUser = user)
      .then(user => user.generateToken())
      .then(token => this.testToken = token);
  });
  beforeEach(function (){
    return new Gallery({...exampleGallery,userID: this.testUser._id.toString()})
      .save()
      .then(gallery => this.testGallery = gallery);
  });
  afterEach(function (){
    return Promise.all([
      User.remove({})
      ,Gallery.remove({})
    ]);
  });
  describe('POST /api/gallery', function (){
    it('should return a gallery',function() {
      return request
        .post('/api/gallery')
        .set({'Authorization': `Bearer ${this.testToken}`})
        .send(exampleGallery)
        .expect(200)
        .expect(res => {
          expect(res.body.name).to.equal(exampleGallery.name);
          expect(res.body.created).to.not.be.undefined;
        });
    });

  });
  describe('GET /api/gallery/:id', function (){
    describe('invalid id', function(){
      it('should return 404', function (){
        return request
          .get('/api/gallery/noID')
          .set({'Authorization': `Bearer ${this.testToken}`})
          .expect(404);
      });
    });
    describe('valid looking id not found', function(){
      it('should return 404', function (){
        return request
          .get('/api/gallery/thislookslikeanid1234567')
          .set({'Authorization': `Bearer ${this.testToken}`})
          .expect(404);
      });
    });
    describe('valid id', function(){
      it('should return a gallery', function (){
        return request
          .get(`/api/gallery/${this.testGallery.id}`)
          .set({'Authorization': `Bearer ${this.testToken}`})
          .expect(200)
          .expect(res => {
            expect(res.body.name).to.equal(exampleGallery.name);
            expect(res.body.created).to.not.be.undefined;
            expect(res.body).to.have.property('desc', exampleGallery.desc);
          });
      });
    });
    describe(`someone else's gallery`, function () {
      before(function () {
        return User.createUser({ username: 'JonnyWrong', email: 'wrong@example.com', password: 'oops' })
          .then(wrong => this.wrong = wrong)
          .then(wrong => wrong.generateToken())
          .then(wrongToken => this.wrongToken = wrongToken);
      });
      it('should return 401', function () {
        return request
          .get(`/api/gallery/${this.testGallery._id}`)
          .set({'Authorization': `Bearer ${this.wrongToken}`})
          .expect(401);
      });
    });
  });
});
