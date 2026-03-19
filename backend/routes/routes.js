// routes/routes.js
const express = require('express');
const router = express.Router();
const { getSafeRoutes } = require('../controllers/routeController');
router.get('/safe', getSafeRoutes);
module.exports = router;
