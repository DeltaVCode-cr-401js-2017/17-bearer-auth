'use-strict';

const app = require('../server');
const request = require('supertest')(app);

describe('Express Infrastructure', function(){
  describe('sould return 404', function(){
    it ('should return 404', function(){
      return request
        .get('/404')
        .auth('user', 'password')
        .expect(404);
    });
    it ('should have CORS headers', function(){
      return request.get('/')
        .expect('Access-Control-Allow-Origin', '*');
    });
  });
});
