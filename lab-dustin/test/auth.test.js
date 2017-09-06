'use strict';

const app = require('../server');
const request = require('supertest')(app);
const { expect } = require('chai');

const debug = require('debug')('app:test/auth');

const User = require('../model/user');
require('../lib/mongoose-connect');

const exampleUser = {
  username: 'example1',
  password: 'password!',
  email: 'example@example.com'
};

describe.skip('Auth routes',function(){
  describe('that fail',function(){
    it('should return 401 for no authentication',function(){
      return request.get('/api/signin')
        .expect(401);
    });
    it('should return 401 for incorrect validation',function(){
      return request.get('/api/signin')
        .auth('invalidUsername','invalidPassword')
        .expect(401);
    });
  });
  describe('GET /api/signin',function(){
    before(function(){
      return new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then(user => this.testUser = user);
    });
    after(function(){
      return User.remove();
    });
    it('should sign in',function(){
      return request.get('/api/signin')
        .auth(exampleUser.username,exampleUser.password)
        .expect(200)
        .expect(res => debug(res.text));
    });
  });
  describe.skip('POST /api/signup',function(){
    describe('without a valid POST',function(){
      before(function(){
        return new User(exampleUser)
          .generatePasswordHash(exampleUser.password)
          .then(user => user.save())
          .then(user => this.testUser = user);
      });
      after(function(){
        return User.remove();
      });
      it('should return 400 for a failed request',function(){
        return request.post('/api/signup')
          .send({
            username: 'example1',
            password: 'password!',

          })
          .expect(400);
      });
    });
    describe('with a valid body',function(){
      after(function(){
        return User.remove();
      });
      it('should succeed',function(){
        return request.post('/api/signup')
          .send(exampleUser)
          .expect(200)
          .expect(res => {
            debug(res.text);
            expect(res.text.substring(0,36)).to.equal('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
          });
      });
    });
  });
});
