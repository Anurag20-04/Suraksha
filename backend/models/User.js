const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 60 },
    email: {
      type: String, required: [true, 'Email is required'],
      unique: true, lowercase: true, trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    phone: { type: String, required: [true, 'Phone is required'], match: [/^\+?[0-9]{10,15}$/, 'Invalid phone'] },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    profilePic: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    institution: { type: String, default: 'NSHM Knowledge Campus' },
    studentId: { type: String, default: '' },
    emergencyContacts: [
      {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        relation: { type: String, default: 'Other' },
        notifyOnEmergency: { type: Boolean, default: true },
      },
    ],
    settings: {
      locationSharing: { type: Boolean, default: true },
      sosVibration: { type: Boolean, default: true },
      audioRecording: { type: Boolean, default: true },
      videoRecording: { type: Boolean, default: false },
      notifyPolice: { type: Boolean, default: true },
      notifyAmbulance: { type: Boolean, default: true },
    },
    lastKnownLocation: {
      lat: Number,
      lng: Number,
      timestamp: Date,
    },
    fcmToken: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
