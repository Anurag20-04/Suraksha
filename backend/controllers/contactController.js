const User = require('../models/User');

exports.getContacts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, contacts: user.emergencyContacts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addContact = async (req, res) => {
  try {
    const { name, phone, relation } = req.body;
    if (!name || !phone) return res.status(400).json({ success: false, message: 'Name and phone required' });
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { emergencyContacts: { name, phone, relation: relation || 'Other', notifyOnEmergency: true } } },
      { new: true }
    );
    res.json({ success: true, contacts: user.emergencyContacts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.removeContact = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { emergencyContacts: { _id: req.params.contactId } } },
      { new: true }
    );
    res.json({ success: true, contacts: user.emergencyContacts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
