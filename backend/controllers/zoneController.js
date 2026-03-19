const Zone = require('../models/Zone');

exports.getAllZones = async (req, res) => {
  try {
    await Zone.seedNSHMZones();
    const zones = await Zone.find({ isActive: true });
    res.json({ success: true, zones });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getNearbyZones = async (req, res) => {
  try {
    const { lat, lng, radius = 1000 } = req.query;
    if (!lat || !lng) return res.status(400).json({ success: false, message: 'lat and lng required' });

    const zones = await Zone.find({ isActive: true });
    const R = 6371e3;
    const nearby = zones.filter((zone) => {
      const φ1 = (parseFloat(lat) * Math.PI) / 180;
      const φ2 = (zone.lat * Math.PI) / 180;
      const Δφ = ((zone.lat - parseFloat(lat)) * Math.PI) / 180;
      const Δλ = ((zone.lng - parseFloat(lng)) * Math.PI) / 180;
      const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
      const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return dist <= parseFloat(radius);
    });

    res.json({ success: true, zones: nearby });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.reportZone = async (req, res) => {
  try {
    const zone = await Zone.findByIdAndUpdate(
      req.params.id,
      { $inc: { reportCount: 1 }, lastIncident: new Date() },
      { new: true }
    );
    if (!zone) return res.status(404).json({ success: false, message: 'Zone not found' });
    // Recalculate risk
    const newScore = Math.min(100, zone.baseRiskScore + zone.reportCount * 2);
    zone.currentRiskScore = newScore;
    zone.riskLevel = newScore >= 75 ? 'critical' : newScore >= 55 ? 'high' : newScore >= 35 ? 'moderate' : 'safe';
    await zone.save();
    res.json({ success: true, zone });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
