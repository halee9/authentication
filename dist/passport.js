'use strict';

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _datamodels = require('@halee9/datamodels');

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _passportJwt = require('passport-jwt');

var _passportLocal = require('passport-local');

var _passportLocal2 = _interopRequireDefault(_passportLocal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (!_config2.default.secret) _config2.default.secret = "super secret"; // Importing Passport, strategies, and config


// tell passport that we have opted to use the email field rather than the username field
var localOptions = { usernameField: 'email' };

// Setting up local login strategy
var localLogin = new _passportLocal2.default(localOptions, function (email, password, done) {
  _datamodels.User.findOne({ email: email }, function (err, user) {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false, { error: 'Your login details could not be verified. Please try again.' });
    }
    user.comparePassword(password, function (err, isMatch) {
      if (err) {
        return done(err);
      }
      if (!isMatch) {
        return done(null, false, { error: "Your login details could not be verified. Please try again." });
      }
      return done(null, user);
    });
  });
});

var jwtOptions = {
  // Telling Passport to check authorization headers for JWT
  jwtFromRequest: _passportJwt.ExtractJwt.fromAuthHeader(),
  // Telling Passport where to find the secret
  secretOrKey: _config2.default.secret
};

// Setting up JWT login strategy
var jwtLogin = new _passportJwt.Strategy(jwtOptions, function (payload, done) {
  _datamodels.User.findById(payload._id, function (err, user) {
    if (err) {
      return done(err, false);
    }
    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  });
});

_passport2.default.use(jwtLogin);
_passport2.default.use(localLogin);