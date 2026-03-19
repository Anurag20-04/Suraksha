const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isAnonymous: { type: Boolean, default: false },
    startLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, default: '' },
      timestamp: { type: Date, default: Date.now },
    },
    endLocation: { lat: Number, lng: Number, address: String, timestamp: Date },
    locationHistory: [{ lat: Number, lng: Number, timestamp: Date }],
    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['active', 'resolved', 'cancelled', 'false_alarm'],
      default: 'active',
    },
    alertedContacts: [{ name: String, phone: String, notifiedAt: Date, method: { type: String, enum: ['sms', 'call', 'push', 'app'], default: 'app' } }],
    policeAlerted: { type: Boolean, default: false },
    ambulanceAlerted: { type: Boolean, default: false },
    recordingUrl: { type: String, default: '' },
    recordingType: { type: String, enum: ['audio', 'video', 'none'], default: 'none' },
    recordingDuration: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    resolvedAt: Date,
    cancelledAt: Date,
    duration: Number, // seconds
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);
