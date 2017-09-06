'use strict';

const app = require('../server');
const request = require('supertest')(app);

//const { expect } = require('chai');

describe('Express Ingrastructure', function () {
  describe('without valid authorization', function(){
    it('should return 401 without authorization header', function () {
      return request.get('/404')
        .expect(401);
    });
    it('should return 404 with non basic authorization', function () {
      return request
        .get('/404')
        .set('Authorization', 'Awesome ')
        .expect(404);
    });
    it('should return 401 with invalid basic authorization', function () {
      return request
        .get('/404')
        .set('Authorization', 'Basic ')
        .expect(401);
    });
    it('should return 401 with missing username', function () {
      return request
        .get('/404')
        .auth('', 'password')
        .expect(401);
    });
    it('should return 401 with missing password', function () {
      return request
        .get('/404')
        .auth('user', '')
        .expect(401);
    });
  });
  describe('with authorization header', function(){
    it('should return 404', function () {
      return request
        .get('/404')
        .auth('user','pass:word')
        .expect(404);
    });
  });

  it('should have CORS headers', function (){
    return request.get('/')
      .expect('Access-Control-Allow-Origin', '*');
  });
});
