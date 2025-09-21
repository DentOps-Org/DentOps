const express = require('express');
const { check } = require('express-validator');
const {
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  archiveRecord,
  downloadRecord,
  upload
} = require('../controllers/records');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all records
router.get('/', getRecords);

// Get, update, delete single record
router
  .route('/:id')
  .get(getRecord)
  .put(updateRecord)
  .delete(deleteRecord);

// Archive record
router.put('/:id/archive', authorize('DENTAL_STAFF'), archiveRecord);

// Download record file
router.get('/:id/download', downloadRecord);

// Create new record - both dental staff and patients
router.post(
  '/',
  upload,
  [
    check('type', 'Record type is required').not().isEmpty(),
    check('title', 'Record title is required').not().isEmpty()
  ],
  createRecord
);

module.exports = router;
