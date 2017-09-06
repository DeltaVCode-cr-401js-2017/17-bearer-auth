'use strict';

const app = require('../server');
const request = require('supertest')(app);

//const { expect } = require('chai');

describe('Express Ingrastructure', function () {
  it('should return 404', function () {
    return request
      .get('/404')
      .auth('user','pass:word')
      .expect(404);
  });
  it('should have CORS headers', function (){
    return request.get('/')
      .expect('Access-Control-Allow-Origin', '*');
  });
});
