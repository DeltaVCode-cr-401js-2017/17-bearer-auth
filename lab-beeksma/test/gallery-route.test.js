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

const updatedGallery = {
  name: 'updated test gallery'
  ,desc: 'look new stuff'
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
    describe('valid authorizaion and body', function(){
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
    describe('invalid authorizaion, valid body', function(){
      it('should return 401 if token is missing',function() {
        return request
          .post('/api/gallery')
          .set({'Authorization': `Bearer `})
          .send(exampleGallery)
          .expect(401);
      });
      it('should return 401 with no authorizaion',function() {
        return request
          .post('/api/gallery')
          .send(exampleGallery)
          .expect(401);
      });
    });
    describe('valid authorizaion and invalid body', function(){
      it('should return 400 if body is missing',function() {
        return request
          .post('/api/gallery')
          .set({'Authorization': `Bearer ${this.testToken}`})
          .expect(400);
      });
      it('should return 400 if body is not valid json',function() {
        return request
          .post('/api/gallery')
          .send('I am not JSON yo')
          .set({'Authorization': `Bearer ${this.testToken}`})
          .expect(400);
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
    describe('No token sent', function(){
      it('should return 401', function (){
        return request
          .get(`/api/gallery/${this.testGallery.id}`)
          .set({'Authorization': `Bearer `})
          .expect(401);
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

  describe('PUT /api/gallery/:id', function (){
    describe('valid id and body', function(){
      it('should return a gallery with updated values', function (){
        return request
          .put(`/api/gallery/${this.testGallery.id}`)
          .set({'Authorization': `Bearer ${this.testToken}`})
          .send(updatedGallery)
          .expect(200)
          .expect(res => {
            expect(res.body.name).to.equal(updatedGallery.name);
            expect(res.body).to.have.property('desc', updatedGallery.desc);
          });
      });
    });
    describe('valid id and invalid body', function(){
      it('should return 400 if no body sent', function (){
        return request
          .put(`/api/gallery/${this.testGallery.id}`)
          .set({'Authorization': `Bearer ${this.testToken}`})
          .expect(400);
      });
      it('should return 400 if invalid body sent', function (){
        return request
          .put(`/api/gallery/${this.testGallery.id}`)
          .set({'Authorization': `Bearer ${this.testToken}`})
          .send('look ma no JSON')
          .expect(400);
      });
    });
    describe('invalid id', function(){
      it('should return 404', function (){
        return request
          .put('/api/gallery/noID')
          .send(updatedGallery)
          .set({'Authorization': `Bearer ${this.testToken}`})
          .expect(404);
      });
    });
    describe('valid looking id not found', function(){
      it('should return 404', function (){
        return request
          .put(`/api/gallery/thislookslikeanid1234567`)
          .send(updatedGallery)
          .set({'Authorization': `Bearer ${this.testToken}`})
          .expect(404);
      });
    });
    describe('No token sent', function(){
      it('should return 401', function (){
        return request
          .put(`/api/gallery/${this.testGallery._id}`)
          .send(updatedGallery)
          .set({'Authorization': `Bearer `})
          .expect(401);
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
          .put(`/api/gallery/${this.testGallery._id}`)
          .send(updatedGallery)
          .set({'Authorization': `Bearer ${this.wrongToken}`})
          .expect(401);
      });
    });
  });
});
