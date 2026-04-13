const express = require('express');
const router = express.Router();
const { submitContact } = require('../contact_controllers/ContactController');

router.post('/', submitContact);

module.exports = router;