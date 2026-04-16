const express = require('express');
const EventRoutes = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Import controllers
const createEvent = require('../controllers/event_controllers/createEvent');
const getAllEvents = require('../controllers/event_controllers/getAllEvents');
const getEventById = require('../controllers/event_controllers/getEventById');
const updateEvent = require('../controllers/event_controllers/updateEvent');
const deleteEvent = require('../controllers/event_controllers/deleteEvent');
const registerForEvent = require('../controllers/event_controllers/registerForEvent');
const unregisterFromEvent = require('../controllers/event_controllers/unregisterFromEvent');
const getEventRegistrations = require('../controllers/event_controllers/getEventRegistrations');
const updateEventStatus = require('../controllers/event_controllers/updateEventStatus');
const markAttendance = require('../controllers/event_controllers/markAttendance');


// Public Routes (Accessible by everyone)
EventRoutes.get('/', getAllEvents);
EventRoutes.get('/:id', getEventById);

// Protected Routes (Accessible only by Organizers and Admins)
EventRoutes.post('/', verifyToken, checkRole(['organizer', 'admin']), createEvent);
EventRoutes.put('/:id', verifyToken, checkRole(['organizer', 'admin']), updateEvent);
EventRoutes.patch('/:id', verifyToken, checkRole(['admin']), updateEventStatus);
EventRoutes.delete('/:id', verifyToken, checkRole(['organizer', 'admin']), deleteEvent);

// User registration routes
EventRoutes.post('/:id/register', verifyToken, registerForEvent);
EventRoutes.delete('/:id/register', verifyToken, unregisterFromEvent);
EventRoutes.get('/:id/registrations', verifyToken, checkRole(['organizer', 'admin']), getEventRegistrations);
EventRoutes.post('/:id/attendance', verifyToken, checkRole(['organizer', 'admin']), markAttendance);

module.exports = EventRoutes;