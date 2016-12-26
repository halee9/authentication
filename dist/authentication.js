'use strict';

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _datamodels = require('@halee9/datamodels');

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (!_config2.default.secret) _config2.default.secret = "super secret";

function generateToken(user) {
  return _jsonwebtoken2.default.sign(user, _config2.default.secret, {
    expiresIn: 10080 // in seconds
  });
}

// Set user info from request
function setUserInfo(request) {
  return {
    _id: request._id,
    firstName: request.profile.firstName,
    lastName: request.profile.lastName,
    email: request.email,
    role: request.role
  };
}

//========================================
// Login Route
//========================================
exports.login = function (req, res, next) {
  var userInfo = setUserInfo(req.user);
  res.status(200).json({
    token: 'JWT ' + generateToken(userInfo),
    user: userInfo
  });
};

//========================================
// Registration Route
//========================================
exports.register = function (req, res, next) {
  // Check for registration errors
  var email = req.body.email;
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var password = req.body.password;

  // Return error if no email provided
  if (!email) {
    return res.status(422).send({ error: 'You must enter an email address.' });
  }

  // Return error if no password provided
  if (!password) {
    return res.status(422).send({ error: 'You must enter a password.' });
  }

  _datamodels.User.findOne({ email: email }, function (err, existingUser) {
    if (err) {
      return next(err);
    }

    // If email is not unique, return error
    if (existingUser) {
      return res.status(422).send({ error: 'That email address is already in use.' });
    }

    // If email is unique and password was provided, create account
    var user = new _datamodels.User({
      email: email,
      password: password,
      profile: { firstName: firstName, lastName: lastName }
    });

    user.save(function (err, user) {
      if (err) {
        return next(err);
      }
      var userInfo = setUserInfo(user);
      res.status(201).json({
        token: 'JWT ' + generateToken(userInfo),
        user: userInfo
      });
    });
  });
};

//========================================
// Authorization Middleware
//========================================

// Role authorization check
exports.roleAuthorization = function (role) {
  return function (req, res, next) {
    var user = req.user;

    _datamodels.User.findById(user._id, function (err, foundUser) {
      if (err) {
        res.status(422).json({ error: 'No user was found.' });
        return next(err);
      }

      // If user is found, check role.
      if (foundUser.role == role) {
        return next();
      }

      res.status(401).json({ error: 'You are not authorized to view this content.' });
      return next('Unauthorized');
    });
  };
};

//= =======================================
// Forgot Password Route
//= =======================================

exports.forgotPassword = function (req, res, next) {
  var email = req.body.email;

  _datamodels.User.findOne({ email: email }, function (err, existingUser) {
    // If user is not found, return error
    if (err || existingUser == null) {
      res.status(422).json({ error: 'Your request could not be processed as entered. Please try again.' });
      return next(err);
    }

    // If user is found, generate and save resetToken

    // Generate a token with Crypto
    _crypto2.default.randomBytes(48, function (err, buffer) {
      var resetToken = buffer.toString('hex');
      if (err) {
        return next(err);
      }

      existingUser.resetPassword.token = resetToken;
      existingUser.resetPassword.expires = Date.now() + 3600000; // 1 hour

      existingUser.save(function (err) {
        // If error in saving token, return it
        if (err) {
          return next(err);
        }

        var message = {
          subject: 'Reset Password',
          text: '' + ('You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' + 'Please click on the following link, or paste this into your browser to complete the process:\n\n' + 'http://') + req.headers.host + '/reset-password/' + resetToken + '\n\n' + 'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };

        // Otherwise, send user email via Mailgun
        mailgun.sendEmail(existingUser.email, message);

        return res.status(200).json({ message: 'Please check your email for the link to reset your password.' });
      });
    });
  });
};

//= =======================================
// Reset Password Route
//= =======================================

exports.verifyToken = function (req, res, next) {
  _datamodels.User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, resetUser) {
    // If query returned no results, token expired or was invalid. Return error.
    if (!resetUser) {
      res.status(422).json({ error: 'Your token has expired. Please attempt to reset your password again.' });
    }

    // Otherwise, save new password and clear resetToken from database
    resetUser.password = req.body.password;
    resetUser.resetPassword.token = undefined;
    resetUser.resetPassword.expires = undefined;

    resetUser.save(function (err) {
      if (err) {
        return next(err);
      }

      // If password change saved successfully, alert user via email
      var message = {
        subject: 'Password Changed',
        text: 'You are receiving this email because you changed your password. \n\n' + 'If you did not request this change, please contact us immediately.'
      };

      // Otherwise, send user email confirmation of password change via Mailgun
      mailgun.sendEmail(resetUser.email, message);

      return res.status(200).json({ message: 'Password changed successfully. Please login with your new password.' });
    });
  });
};