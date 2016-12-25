import {
  login,
  register,
  requireLogin
} from './src';

import express from 'express';

const REQUIRE_ADMIN = "Admin";
const REQUIRE_STAFF = "Staff";
const REQUIRE_CUSTOMER = "Customer";

module.exports = function(app) {
  // Initializing route groups
  const apiRoutes = express.Router();
  const authRoutes = express.Router();

  //=========================
  // Auth Routes
  //=========================
  // Set auth routes as subgroup/middleware to apiRoutes
  apiRoutes.use('/auth', authRoutes);
  // Registration route
  authRoutes.post('/register', register);
  // Login route
  authRoutes.post('/login', requireLogin, login);
  // Set url for API group routes
  app.use('/api', apiRoutes);
};
