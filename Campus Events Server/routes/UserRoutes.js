const express = require('express');
const UserRoutes = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Import controllers
const getUserRegistrations = require('../controllers/user_controllers/getUserRegistrations');
const profile = require('../controllers/auth_controllers/profile'); // Assuming profile is still in auth_controllers
const updateProfile = require('../controllers/user_controllers/updateProfile');
const getAllUsers = require('../controllers/user_controllers/getAllUsers');
const getQrToken = require('../controllers/user_controllers/getQrToken');

// Protected Routes
UserRoutes.get('/', verifyToken, checkRole(['admin']), getAllUsers);
UserRoutes.get('/registrations', verifyToken, getUserRegistrations);
UserRoutes.get('/profile', verifyToken, profile);
UserRoutes.put('/profile', verifyToken, updateProfile);
UserRoutes.get('/registrations/:eventId/qr', verifyToken, getQrToken);

module.exports = UserRoutes;