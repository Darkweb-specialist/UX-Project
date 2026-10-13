const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/donations - List all donations with optional filtering
router.get('/', (req, res) => {
  try {
    let items = db.getDonationsList();
    const { category, status, search } = req.query;

    if (category && category !== 'All') {
      items = items.filter((d) => d.category === category);
    }

    if (status && status !== 'All') {
      items = items.filter((d) => d.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (d) =>
          d.foodName?.toLowerCase().includes(q) ||
          d.pickupAddress?.toLowerCase().includes(q) ||
          d.donorName?.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/donations/:id - Get specific donation details
router.get('/:id', (req, res) => {
  try {
    const item = db.getDonationById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/donations - Create a new donation
router.post('/', (req, res) => {
  try {
    const {
      foodName,
      category,
      quantity,
      unit,
      description,
      preparedAt,
      pickupDeadline,
      pickupAddress,
      donorPhone,
      donorName,
      donorType,
      dietary,
      imageUrl,
      latitude,
      longitude,
    } = req.body;

    if (!foodName || !quantity || !pickupDeadline || !pickupAddress) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields (foodName, quantity, pickupDeadline, pickupAddress)',
      });
    }

    const newDonation = {
      id: req.body.id || `don-${Date.now()}`,
      foodName,
      category: category || 'Cooked Meals',
      quantity,
      unit: unit || 'boxes',
      description: description || '',
      preparedAt: preparedAt || 'Recently',
      pickupDeadline,
      pickupAddress,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      donorName: donorName || 'Verified Donor',
      donorPhone: donorPhone || '+91 99999 00000',
      donorType: donorType || 'Restaurant',
      status: 'Available',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80',
      dietary: dietary || 'Vegetarian',
      createdAt: new Date().toISOString(),
    };

    db.insertDonation(newDonation);

    res.status(201).json({
      success: true,
      message: 'Food donation published successfully',
      data: newDonation,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/donations/:id/status - Update donation status
router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const existing = db.getDonationById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    db.updateDonationStatus(req.params.id, status);

    res.json({
      success: true,
      message: `Donation status updated to ${status}`,
      data: { id: req.params.id, status },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
