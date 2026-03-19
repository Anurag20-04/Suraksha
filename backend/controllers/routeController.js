const axios = require('axios');
const Zone = require('../models/Zone');

const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Sample points along a polyline (simplified)
const samplePolylinePoints = (points, interval = 5) => {
  const sampled = [];
  for (let i = 0; i < points.length; i += interval) sampled.push(points[i]);
  if (sampled[sampled.length - 1] !== points[points.length - 1]) sampled.push(points[points.length - 1]);
  return sampled;
};

// Calculate haversine distance
const haversine = (lat1, lng1, lat2, lng2) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Score a single point against all zones
const scorePoint = (lat, lng, zones) => {
  let maxScore = 0;
  zones.forEach((zone) => {
    const dist = haversine(lat, lng, zone.lat, zone.lng);
    if (dist <= zone.radius) {
      const score = zone.currentRiskScore || zone.baseRiskScore;
      if (score > maxScore) maxScore = score;
    }
  });
  return maxScore;
};

exports.getSafeRoutes = async (req, res) => {
  try {
    const { originLat, originLng, destLat, destLng } = req.query;
    if (!originLat || !destLat)
      return res.status(400).json({ success: false, message: 'Origin and destination required' });

    const zones = await Zone.find({ isActive: true });

    // If no Google Maps key, return mock routes with risk scores
    if (!GOOGLE_MAPS_KEY || GOOGLE_MAPS_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
      const mockRoutes = [
        {
          id: 'route-1',
          summary: 'Via NSHM Main Gate Road',
          distance: '2.1 km',
          duration: '7 mins',
          riskScore: 28,
          riskLevel: 'safe',
          recommended: true,
          waypoints: [
            { lat: parseFloat(originLat), lng: parseFloat(originLng) },
            { lat: 23.5204, lng: 87.3119 },
            { lat: parseFloat(destLat), lng: parseFloat(destLng) },
          ],
        },
        {
          id: 'route-2',
          summary: 'Via Market Road',
          distance: '1.8 km',
          duration: '6 mins',
          riskScore: 52,
          riskLevel: 'moderate',
          recommended: false,
          waypoints: [
            { lat: parseFloat(originLat), lng: parseFloat(originLng) },
            { lat: 23.5215, lng: 87.3142 },
            { lat: parseFloat(destLat), lng: parseFloat(destLng) },
          ],
        },
        {
          id: 'route-3',
          summary: 'Via Station Bypass',
          distance: '1.5 km',
          duration: '5 mins',
          riskScore: 74,
          riskLevel: 'high',
          recommended: false,
          waypoints: [
            { lat: parseFloat(originLat), lng: parseFloat(originLng) },
            { lat: 23.5187, lng: 87.3088 },
            { lat: parseFloat(destLat), lng: parseFloat(destLng) },
          ],
        },
      ];
      return res.json({ success: true, routes: mockRoutes });
    }

    // Real Google Directions API call
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}&destination=${destLat},${destLng}&alternatives=true&key=${GOOGLE_MAPS_KEY}`;
    const { data } = await axios.get(url);
    if (data.status !== 'OK')
      return res.status(400).json({ success: false, message: data.status });

    const routes = data.routes.map((route) => {
      const leg = route.legs[0];
      const steps = route.overview_path || [];
      const sampled = samplePolylinePoints(steps);
      const scores = sampled.map((p) => scorePoint(p.lat, p.lng, zones));
      const riskScore = Math.round(scores.reduce((a, b) => a + b, 0) / (scores.length || 1));
      const riskLevel = riskScore >= 65 ? 'high' : riskScore >= 40 ? 'moderate' : 'safe';

      return {
        id: route.summary,
        summary: route.summary,
        distance: leg.distance.text,
        duration: leg.duration.text,
        riskScore,
        riskLevel,
        polyline: route.overview_polyline.points,
        waypoints: [],
      };
    });

    routes.sort((a, b) => a.riskScore - b.riskScore);
    routes[0].recommended = true;

    res.json({ success: true, routes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
