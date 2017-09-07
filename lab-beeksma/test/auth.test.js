'use strict';

const app = require('../server');
const request = require('supertest')(app);
const debug = require('debug')('app:test/auth');

const User = require('../model/user');
require('../lib/mongoose-connect');
const { expect } = require('chai');

const exampleUser = {
  username: 'example'
  ,password: 'password!'
  ,email: 'example@example.com'
};

const missingPassUser = {
  username: 'example'
  ,email: 'example@example.com'
};

const missingUserUser = {
  password: 'password!'
  ,email: 'example@example.com'
};

describe('Auth Routes', function (){
  describe('GET /api/signin', function(){
    before(function(){
      return new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then(user => this.testUser = user);
    });
    after(function(){
      return User.remove({});
    });
    it('should sign in', function (){
      return request
        .get('/api/signin')
        .auth(exampleUser.username, exampleUser.password)
        .expect(200)
        .expect(res => {
          debug(res.text);
          expect(res.text.substring(0, 36)).to.equal('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
        });
    });
  });

  describe('POST /api/signup', function(){
    after(function(){
      return User.remove({});
    });
    describe('with missing body', function(){
      it('should return a 400 error', function(){
        return request
          .post('/api/signup')
          .expect(400);
      });
    });

    describe('with missing password', function() {
      it('should return a 400 error for missing password', function(){
        return request
          .post('/api/signup')
          .send(missingPassUser)
          .expect(400);
      });
    });

    describe('with missing username', function() {
      it('should return a 400 error for missing password', function(){
        return request
          .post('/api/signup')
          .send(missingUserUser)
          .expect(400);
      });
    });
    describe('with a valid body',function(){
      it('should succeed i guess', function(){
        return request
          .post('/api/signup')
          .send(exampleUser)
          .expect(200)
          .expect(res => {
            debug(res.text);
            expect(res.text.substring(0, 36)).to.equal('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
          });
      });
    });
    // TODO: test invalid bodies!
  });
});
