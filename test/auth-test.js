//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');

import { User } from '@halee9/datamodels';

let should = chai.should();
chai.use(chaiHttp);

//Our parent block
describe('Authentication', () => {
  before((done) => {
    User.remove({}, (err) => {
      done();
    });
  });

  describe('/POST register', () => {
    it('should not register without email', (done) => {
      let newUser = {
        password: "password",
        firstName: "Jane",
        lastName: "Doe"
      };
      chai.request(server)
      .post('/api/auth/register')
      .send(newUser)
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.have.property('error').eql('You must enter an email address.');
        done();
      });
    });

    it('should not register without password', (done) => {
      let newUser = {
        email: "jane@doe.com",
        firstName: "Jane",
        lastName: "Doe"
      };
      chai.request(server)
      .post('/api/auth/register')
      .send(newUser)
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.have.property('error').eql('You must enter a password.');
        done();
      });
    });

    it('should register a user', (done) => {
      let newUser = {
        email: "jane@doe.com",
        password: "password",
        firstName: "Jane",
        lastName: "Doe"
      };
      chai.request(server)
      .post('/api/auth/register')
      .send(newUser)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.have.property('token');
        res.body.should.have.property('user');
        done();
      });
    });

    it('should not register with email already exist', (done) => {
      let newUser = {
        email: "jane@doe.com",
        password: "password",
        firstName: "John",
        lastName: "Doe"
      };
      chai.request(server)
      .post('/api/auth/register')
      .send(newUser)
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.have.property('error').eql('That email address is already in use.');
        done();
      });
    });

  });

  describe('/POST login', () => {
    it('should login with email and password', (done) => {
      let loginUser = {
        email: "jane@doe.com",
        password: "password",
      };
      chai.request(server)
      .post('/api/auth/login')
      .send(loginUser)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('token');
        res.body.should.have.property('user');
        done();
      });
    });

    it('should not login with an unregistered email', (done) => {
      let loginUser = {
        email: "john@doe.com",
        password: "password",
      };
      chai.request(server)
      .post('/api/auth/login')
      .send(loginUser)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
    });

    it('should not login with an wrong password', (done) => {
      let loginUser = {
        email: "jane@doe.com",
        password: "wrongpassword",
      };
      chai.request(server)
      .post('/api/auth/login')
      .send(loginUser)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
    });

  });
});
