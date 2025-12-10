// src/routes/ai.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { expandTreatmentNotes } = require('../services/aiService');


/**
 * POST /api/ai/expand-notes
 * Expands brief treatment notes into professional documentation
 * Auth: Dentist or Manager only
 */
router.post('/expand-notes', protect, authorize('DENTIST', 'CLINIC_MANAGER'), async (req, res) => {
  try {
    const { notes } = req.body;

    // Validation
    if (!notes || typeof notes !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Notes are required and must be a string'
      });
    }

    if (notes.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Notes cannot be empty'
      });
    }

    if (notes.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Notes are too long. Please keep them under 1000 characters.'
      });
    }

    // Call AI service
    const expandedNotes = await expandTreatmentNotes(notes);

    res.status(200).json({
      success: true,
      data: {
        originalNotes: notes,
        expandedNotes: expandedNotes
      }
    });

  } catch (error) {
    console.error('Expand notes error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to expand treatment notes'
    });
  }
});

module.exports = router;
