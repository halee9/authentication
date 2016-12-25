'use strict';

var _passport = require('./passport');

var _passport2 = _interopRequireDefault(_passport);

var _authentication = require('./authentication');

var _authentication2 = _interopRequireDefault(_authentication);

var _passport3 = require('passport');

var _passport4 = _interopRequireDefault(_passport3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  login: _authentication2.default.login,
  register: _authentication2.default.register,
  roleAuthorization: _authentication2.default.roleAuthorization,
  forgotPassword: _authentication2.default.forgotPassword,
  verifyToken: _authentication2.default.verifyToken,
  requireAuth: _passport4.default.authenticate('jwt', { session: false }),
  requireLogin: _passport4.default.authenticate('local', { session: false })
};