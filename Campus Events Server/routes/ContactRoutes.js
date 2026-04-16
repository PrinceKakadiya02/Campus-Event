const express = require('express');
const router = express.Router();
const { submitContact } = require('../controllers/contact_controllers/ContactController');

router.post('/', submitContact); // Assuming contact_controllers will be moved

module.exports = router;