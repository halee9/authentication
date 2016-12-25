import authPassport from './passport';
import Authentication from './authentication';
import passport from 'passport';

module.exports = {
  login: Authentication.login,
  register: Authentication.register,
  roleAuthorization: Authentication.roleAuthorization,
  forgotPassword: Authentication.forgotPassword,
  verifyToken: Authentication.verifyToken,
  requireAuth: passport.authenticate('jwt', { session: false }),
  requireLogin: passport.authenticate('local', { session: false })
}
