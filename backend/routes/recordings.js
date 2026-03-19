// routes/recordings.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Upload recording metadata after S3/Firebase direct upload
router.post('/', protect, async (req, res) => {
  try {
    const Recording = require('../models/Recording');
    const { alertId, fileUrl, fileType, fileSize, duration, storageKey, storageProvider, location } = req.body;
    const recording = await Recording.create({
      userId: req.user._id, alertId, fileUrl, fileType, fileSize, duration,
      storageKey, storageProvider: storageProvider || 'aws-s3',
      location, uploadStatus: 'completed',
    });
    // Link to alert
    if (alertId) {
      await require('../models/Alert').findByIdAndUpdate(alertId, {
        recordingUrl: fileUrl, recordingType: fileType, recordingDuration: duration,
      });
    }
    res.status(201).json({ success: true, recording });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/my', protect, async (req, res) => {
  try {
    const Recording = require('../models/Recording');
    const recordings = await Recording.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, recordings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
