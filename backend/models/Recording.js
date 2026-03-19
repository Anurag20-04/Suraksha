const mongoose = require('mongoose');

const recordingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    alertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alert' },
    fileUrl: { type: String, required: true },
    fileType: { type: String, enum: ['audio', 'video'], required: true },
    fileSize: { type: Number, default: 0 }, // bytes
    duration: { type: Number, default: 0 }, // seconds
    storageProvider: { type: String, enum: ['aws-s3', 'firebase', 'local'], default: 'aws-s3' },
    storageKey: { type: String }, // S3 key or Firebase path
    isEncrypted: { type: Boolean, default: true },
    uploadStatus: { type: String, enum: ['pending', 'uploading', 'completed', 'failed'], default: 'pending' },
    location: { lat: Number, lng: Number },
    expiresAt: { type: Date, default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000) }, // 30 days
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recording', recordingSchema);
