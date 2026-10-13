const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/stats - Summary statistics
router.get('/', (req, res) => {
  try {
    const donations = db.getDonationsList();
    const pickups = db.getPickupsList();

    const availableCount = donations.filter((d) => d.status === 'Available').length;
    const requestedCount = donations.filter((d) => d.status === 'Requested').length;
    const acceptedCount = donations.filter((d) => d.status === 'Accepted').length;
    const completedCount = donations.filter((d) => d.status === 'Picked Up').length;

    res.json({
      success: true,
      data: {
        totalDonations: donations.length,
        available: availableCount,
        requested: requestedCount,
        accepted: acceptedCount,
        completed: completedCount,
        totalPickups: pickups.length,
        activePickups: pickups.filter((p) => p.status === 'Requested' || p.status === 'Accepted').length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
