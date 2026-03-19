// routes/zones.js
const express = require('express');
const router = express.Router();
const { getAllZones, getNearbyZones, reportZone } = require('../controllers/zoneController');
router.get('/', getAllZones);
router.get('/nearby', getNearbyZones);
router.patch('/:id/report', reportZone);
module.exports = router;
