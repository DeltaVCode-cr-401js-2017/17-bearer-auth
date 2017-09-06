'use strict';

const app = require('../server');
const request = require('supertest')(app);

describe('Express Infrastructure', function(){
  describe('without vadid authorization',function(){
    it('should return 401',function(){
      return request.get('/404')
        .expect(401);
    });
    it('should return 401',function(){
      return request.get('/404')
        .set('Authorization','Basic ');
    });
    it('should return 401 for missing username',function(){
      return request.get('/404')
        .auth('','password')
        .expect(401);
    });
    it('should return 401 for missing password',function(){
      return request.get('/404')
        .auth('username','')
        .expect(401);
    });
  });
  describe('with authHeader',function(){
    it('should return 404',function(){
      return request.get('/404')
        .auth('Authorization','Basic whatevs')
        .expect(404);
    });
    it('should have CORS headers',function(){
      return request.get('/')
        .expect('Access-Control-Allow-Origin', '*');
    });
  });
});
