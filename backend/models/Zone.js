const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema(
  {
    areaName: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    radius: { type: Number, default: 200 }, // meters
    riskLevel: {
      type: String,
      enum: ['safe', 'moderate', 'high', 'critical'],
      default: 'moderate',
    },
    baseRiskScore: { type: Number, required: true, min: 0, max: 100 },
    currentRiskScore: { type: Number, min: 0, max: 100 },
    reason: { type: String, default: '' },
    incidentCount: { type: Number, default: 0 },
    reportCount: { type: Number, default: 0 },
    lastIncident: Date,
    isActive: { type: Boolean, default: true },
    tags: [String],
  },
  { timestamps: true }
);

// Seed NSHM zones
zoneSchema.statics.seedNSHMZones = async function () {
  const count = await this.countDocuments();
  if (count > 0) return;

  const zones = [
    { areaName: 'NSHM Main Gate', lat: 23.5204, lng: 87.3119, riskLevel: 'safe', baseRiskScore: 25, reason: 'Well-lit, security guard present', tags: ['campus', 'guarded'] },
    { areaName: 'Hostel Road', lat: 23.5198, lng: 87.3105, riskLevel: 'moderate', baseRiskScore: 45, reason: 'Poorly lit at night, limited footfall', tags: ['road', 'night-risk'] },
    { areaName: 'Market Area', lat: 23.5215, lng: 87.3142, riskLevel: 'moderate', baseRiskScore: 50, reason: 'Crowded during day, risky at night', tags: ['market', 'crowded'] },
    { areaName: 'Durgapur Station Road', lat: 23.5187, lng: 87.3088, riskLevel: 'moderate', baseRiskScore: 60, reason: 'High traffic, reported incidents', tags: ['station', 'traffic'] },
    { areaName: 'Isolated Bypass', lat: 23.5172, lng: 87.3065, riskLevel: 'critical', baseRiskScore: 80, reason: 'Isolated, no streetlights, minimal CCTV', tags: ['isolated', 'dark'] },
    { areaName: 'Industrial Road Stretch', lat: 23.5231, lng: 87.3158, riskLevel: 'high', baseRiskScore: 75, reason: 'Industrial zone, low pedestrian activity', tags: ['industrial', 'low-footfall'] },
    { areaName: 'Dark Side Streets', lat: 23.5193, lng: 87.3132, riskLevel: 'high', baseRiskScore: 70, reason: 'No CCTV, reported harassment incidents', tags: ['dark', 'no-cctv'] },
  ];

  await this.insertMany(zones.map(z => ({ ...z, currentRiskScore: z.baseRiskScore })));
  console.log('✅ NSHM safety zones seeded');
};

module.exports = mongoose.model('Zone', zoneSchema);
