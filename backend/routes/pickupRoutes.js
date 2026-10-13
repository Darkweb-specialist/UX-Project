const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/pickups - Get all pickup requests
router.get('/', (req, res) => {
  try {
    const pickups = db.getPickupsList();
    res.json({
      success: true,
      count: pickups.length,
      data: pickups,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/pickups - Create a pickup request
router.post('/', (req, res) => {
  try {
    const {
      donationId,
      foodName,
      quantity,
      receiverName,
      receiverPhone,
      receiverRole,
      pickupTimeEstimated,
      pickupAddress,
      notes,
    } = req.body;

    if (!donationId) {
      return res.status(400).json({ success: false, message: 'donationId is required' });
    }

    const newRequest = {
      id: req.body.id || `req-${Date.now()}`,
      donationId,
      foodName: foodName || 'Surplus Food Batch',
      quantity: quantity || 'Standard Quantity',
      receiverName: receiverName || 'Community Volunteer',
      receiverPhone: receiverPhone || '+91 99999 00000',
      receiverRole: receiverRole || 'NGO',
      pickupTimeEstimated: pickupTimeEstimated || 'Within 2 hours',
      pickupAddress: pickupAddress || 'Donation Pickup Point',
      notes: notes || '',
      status: 'Requested',
      requestedAt: new Date().toISOString(),
    };

    db.insertPickupRequest(newRequest);
    db.updateDonationStatus(donationId, 'Requested');

    res.status(201).json({
      success: true,
      message: 'Pickup request created successfully',
      data: newRequest,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/pickups/:id/status - Update pickup status
router.patch('/:id/status', (req, res) => {
  try {
    const { status, donationId } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    db.updatePickupStatus(req.params.id, status);

    if (donationId) {
      const donStatus = status === 'Cancelled' ? 'Available' : status;
      db.updateDonationStatus(donationId, donStatus);
    }

    res.json({
      success: true,
      message: `Pickup status updated to ${status}`,
      data: { id: req.params.id, status },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
