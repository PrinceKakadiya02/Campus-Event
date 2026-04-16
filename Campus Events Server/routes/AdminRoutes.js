const express = require('express');
const AdminRoutes = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const updateOrganizerStatus = require('../controllers/admin_controllers/updateOrganizerStatus');
const { getAllContacts } = require('../controllers/contact_controllers/ContactController');

// Admin specific routes
AdminRoutes.patch('/organizer/:id', verifyToken, checkRole(['admin']), updateOrganizerStatus); // Assuming admin_controllers will be moved
AdminRoutes.get('/contacts', verifyToken, checkRole(['admin']), getAllContacts); // Path updated to reflect /controllers/contact_controllers

module.exports = AdminRoutes;