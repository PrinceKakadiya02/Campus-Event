const express = require('express');
const AdminRoutes = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const updateOrganizerStatus = require('../admin_controllers/updateOrganizerStatus');
const { getAllContacts } = require('../contact_controllers/ContactController');

// Admin specific routes
AdminRoutes.patch('/organizer/:id', verifyToken, checkRole(['admin']), updateOrganizerStatus);
AdminRoutes.get('/contacts', verifyToken, checkRole(['admin']), getAllContacts);

module.exports = AdminRoutes;