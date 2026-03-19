const express = require('express');
const router = express.Router();
const { triggerAlert, updateAlertLocation, resolveAlert, getMyAlerts } = require('../controllers/alertController');
const { protect, optionalAuth } = require('../middleware/auth');
router.post('/', optionalAuth, triggerAlert);           // Works without login
router.patch('/:id/location', updateAlertLocation);
router.patch('/:id/resolve', resolveAlert);
router.get('/my', protect, getMyAlerts);
module.exports = router;
