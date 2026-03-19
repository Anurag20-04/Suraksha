const Alert = require('../models/Alert');
const Zone = require('../models/Zone');
const User = require('../models/User');

// Risk score engine
const calculateRiskScore = async (lat, lng) => {
  const zones = await Zone.find({ isActive: true });
  let maxScore = 25; // default moderate

  const R = 6371e3;
  zones.forEach((zone) => {
    const φ1 = (lat * Math.PI) / 180;
    const φ2 = (zone.lat * Math.PI) / 180;
    const Δφ = ((zone.lat - lat) * Math.PI) / 180;
    const Δλ = ((zone.lng - lng) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    if (dist <= zone.radius) {
      const score = zone.currentRiskScore || zone.baseRiskScore;
      if (score > maxScore) maxScore = score;
    }
  });

  // Time factor: night hours increase risk
  const hour = new Date().getHours();
  let timeFactor = 0;
  if (hour >= 22 || hour < 5) timeFactor = 20;
  else if (hour >= 20 || hour < 6) timeFactor = 10;

  return Math.min(100, maxScore + timeFactor);
};

// POST /api/alerts — trigger emergency (works without auth)
exports.triggerAlert = async (req, res) => {
  try {
    const { lat, lng, address, isAnonymous } = req.body;
    if (!lat || !lng) return res.status(400).json({ success: false, message: 'Location required' });

    const riskScore = await calculateRiskScore(lat, lng);

    const alertData = {
      startLocation: { lat, lng, address: address || '', timestamp: new Date() },
      locationHistory: [{ lat, lng, timestamp: new Date() }],
      riskScore,
      status: 'active',
      policeAlerted: true,
      ambulanceAlerted: true,
      isAnonymous: isAnonymous || !req.user,
    };

    if (req.user) {
      alertData.userId = req.user._id;
      const userContacts = req.user.emergencyContacts || [];
      alertData.alertedContacts = [
        { name: 'Police', phone: '100', notifiedAt: new Date(), method: 'call' },
        { name: 'Ambulance', phone: '102', notifiedAt: new Date(), method: 'call' },
        ...userContacts.filter(c => c.notifyOnEmergency).map(c => ({
          name: c.name, phone: c.phone, notifiedAt: new Date(), method: 'sms',
        })),
      ];
    } else {
      alertData.alertedContacts = [
        { name: 'Police', phone: '100', notifiedAt: new Date(), method: 'call' },
        { name: 'Ambulance', phone: '102', notifiedAt: new Date(), method: 'call' },
      ];
    }

    const alert = await Alert.create(alertData);

    // Emit to socket room if user logged in
    if (req.user && req.io) {
      req.io.to(`emergency-${req.user._id}`).emit('emergency-started', { alertId: alert._id, riskScore });
    }

    // In production: trigger Twilio SMS, push notifications here

    res.status(201).json({
      success: true,
      alertId: alert._id,
      riskScore,
      alertedContacts: alert.alertedContacts,
      message: 'Emergency alert triggered successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/alerts/:id/location — update live location
exports.updateAlertLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        endLocation: { lat, lng, timestamp: new Date() },
        $push: { locationHistory: { lat, lng, timestamp: new Date() } },
      },
      { new: true }
    );
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });

    if (req.io && alert.userId) {
      req.io.to(`emergency-${alert.userId}`).emit('location-update', { lat, lng });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/alerts/:id/resolve
exports.resolveAlert = async (req, res) => {
  try {
    const { status } = req.body; // 'resolved' | 'cancelled' | 'false_alarm'
    const now = new Date();
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        status: status || 'resolved',
        resolvedAt: now,
        duration: Math.floor((now - alert?.createdAt) / 1000),
      },
      { new: true }
    );
    res.json({ success: true, alert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/alerts/my — user's alert history
exports.getMyAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
