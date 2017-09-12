'use strict';
const app = require('../server');
const request = require('supertest')(app);
const { expect } = require('chai');
const User = require('../model/user');
const Gallery = require('../model/gallery');
require('../lib/mongoose-connect');

const debug = require('debug')('app:test/gallery-route');

const exampleUser = {
  username: 'example',
  password: 'password!',
  email: 'example@example.com'
};

const exampleGallery = {
  name: 'test gallery',
  desc: 'amazing test gallery description'
};

const exampleHacker = {
  username: 'hackerDude',
  password: 'notmypassword',
  email: 'hacker@example.com'
};

describe('Gallery Routes',function(){
  beforeEach(function () {
    return User.createUser(exampleUser)
      .then(user => this.testUser = user)
      .then(user => {
        debug('testUser ',user);
        return user;
      })
      .then(user => user.generateToken())
      .then(token => this.testToken = token)
      .then(token => {
        debug('testToken ',token);
      });
  });
  afterEach(function(){
    delete this.testUser;
    delete this.testToken;

    return Promise.all([
      User.remove({}),
      Gallery.remove({})
    ]);
  });

  describe('POST /api/gallery',function(){
    it('should return a gallery', function(){
      return request.post('/api/gallery')
        .set({ Authorization: `Bearer ${this.testToken}` })
        .send(exampleGallery)
        .expect(200)
        .expect(res => {
          expect(res.body.name).to.equal(exampleGallery.name);
          expect(res.body).to.have.property('desc',exampleGallery.desc);
          expect(res.body.created).to.not.be.undefined;
        });
    });
    it('should return 401 if token is not provided',function(){
      return request.post('/api/gallery')
        .send(exampleGallery)
        .expect(401);
    });
    it('should return 400 if body is not provided',function(){
      return request.post('/api/gallery')
        .set({ Authorization: `Bearer ${this.testToken}` })
        .expect(400);
    });
  });

  describe('GET /api/gallery/:id',function(){
    it('for invalid id',function(){
      return request.get('/api/gallery/missing')
        .set({ Authorization: `Bearer ${this.testToken}` })
        .expect(404);
    });
    it('for missing id',function(){
      return request.get('/api/gallery')
        .set({ Authorization: `Bearer ${this.testToken}` })
        .expect(404);
    });
    describe('valid id',function(){
      beforeEach(function(){
        return new Gallery({
          ...exampleGallery,
          userID: this.testUser._id.toString()
        }).save()
          .then(gallery => this.testGallery = gallery)
          .then(gallery => debug('gallery ',gallery));
      });
      afterEach(function(){
        delete this.testGallery;

        return Promise.resolve(Gallery.remove({}));
      });
      it('should return a gallery',function(){
        return request.get(`/api/gallery/${this.testGallery._id}`)
          .set({ Authorization: `Bearer ${this.testToken}` })
          .expect(200)
          .expect(res => {
            console.log('body', res.body);
            expect(res.body.name).to.equal(exampleGallery.name);
            expect(res.body).to.have.property('desc',exampleGallery.desc);
            expect(res.body.created).to.not.be.undefined;
          });
      });
    });
    describe('bad token',function(){
      beforeEach(function(){
        return Gallery.createGallery(exampleGallery,this.testUser._id)
          .then(gallery => this.testGallery = gallery);
      });
      beforeEach(function(){
        return User.createUser(exampleHacker)
          .then(hacker => this.testHacker = hacker)
          .then(hacker => hacker.generateToken())
          .then(token => this.hackerToken = token);
      });
      it('should return 401 if no token provided',function(){
        return request.get(`/api/gallery${this.testGallery._id}`)
          .expect(401);
      });
      it('should return 401 if the token is invalid',function(){
        return request.get(`/api/gallery/${this.testGallery._id}`)
          .set({ Authorization: `Bearer ${this.hackerToken}`})
          .expect(401);
      });
    });
  });
  describe.only('PUT /api/gallery',function(){
    beforeEach(function(){
      return new Gallery({
        ...exampleGallery,
        userID: this.testUser._id.toString()
      }).save()
        .then(gallery => this.testGallery = gallery)
        .then(gallery => debug('gallery ',gallery));
    });
    afterEach(function(){
      delete this.testGallery;

      return Promise.resolve(Gallery.remove({}));
    });
    it('should return 200 with a valid id',function(){
      return request.put(`/api/gallery/${this.testGallery._id}`)
        .set({ Authorization: `Bearer ${this.testToken}` })
        .send({ name: 'newGalleryName' })
        .expect(200)
        .expect(res => {
          expect(res.body.name).to.equal('newGalleryName');
          expect(res.body.desc).to.equal('amazing test gallery description');
        });
    });
  });
});
