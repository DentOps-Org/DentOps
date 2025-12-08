const express = require('express');
const { check } = require('express-validator');
const {
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord
} = require('../controllers/records');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getRecords)
  .post(
    [
      check('title', 'Title is required').not().isEmpty(),
      check('type', 'Type is required').not().isEmpty()
    ],
    createRecord
  );

router.route('/:id')
  .get(getRecord)
  .put(updateRecord)
  .delete(deleteRecord);

module.exports = router;