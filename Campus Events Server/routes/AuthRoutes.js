const express = require('express');
const AuthRoutes = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');

// Import controllers
const register = require('../auth_controllers/register');
const login = require('../auth_controllers/login');
const getMe = require('../auth_controllers/getMe');
const logout = require('../auth_controllers/logout');
const sendOtp = require('../auth_controllers/sendOtp');
const verifyOtp = require('../auth_controllers/verifyOtp');
const forgotPassword = require('../auth_controllers/forgotPassword');
const resetPassword = require('../auth_controllers/resetPassword');

// Public Routes
AuthRoutes.post('/register', register);
AuthRoutes.post('/login', login);
AuthRoutes.post('/send-otp', sendOtp);
AuthRoutes.post('/verify-otp', verifyOtp);
AuthRoutes.post('/forgot-password', forgotPassword);
AuthRoutes.post('/reset-password', resetPassword);

// Protected Routes
AuthRoutes.get('/me', verifyToken, getMe);
AuthRoutes.post('/logout', verifyToken, logout);

module.exports = AuthRoutes;