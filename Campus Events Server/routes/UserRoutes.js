const express = require('express');
const UserRoutes = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Import controllers
const getUserRegistrations = require('../user_controllers/getUserRegistrations');
const profile = require('../auth_controllers/profile');
const updateProfile = require('../user_controllers/updateProfile');
const getAllUsers = require('../user_controllers/getAllUsers');
const getQrToken = require('../user_controllers/getQrToken');

// Protected Routes
UserRoutes.get('/', verifyToken, checkRole(['admin']), getAllUsers);
UserRoutes.get('/registrations', verifyToken, getUserRegistrations);
UserRoutes.get('/profile', verifyToken, profile);
UserRoutes.put('/profile', verifyToken, updateProfile);
UserRoutes.get('/registrations/:eventId/qr', verifyToken, getQrToken);

module.exports = UserRoutes;