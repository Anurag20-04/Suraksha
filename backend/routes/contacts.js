// routes/contacts.js
const express = require('express');
const router = express.Router();
const { getContacts, addContact, removeContact } = require('../controllers/contactController');
const { protect } = require('../middleware/auth');
router.get('/', protect, getContacts);
router.post('/', protect, addContact);
router.delete('/:contactId', protect, removeContact);
module.exports = router;
