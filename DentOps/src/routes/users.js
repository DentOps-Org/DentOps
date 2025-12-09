const express = require('express');
const { check } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { getMe } = require('../controllers/auth');
const { getUsers, getProviders, getUser, createUser, updateUser, deleteUser } = require('../controllers/users');

const router = express.Router();

// Get current user route
router.get('/me', protect, getMe);

// Get providers (accessible by all authenticated users)
router.get('/providers', protect, getProviders); //TODO:whats the need for this??

// Routes for /users
router
  .route('/')
  .get(protect, authorize('DENTAL_STAFF'), getUsers)
  .post( //TODO: dont get this one , is it even required?? redundant
    protect,
    authorize('DENTAL_STAFF'),
    [
      check('fullName', 'Name is required').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail(),
      check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
    ],
    createUser
  );

router
  .route('/:id')
  .get(protect, getUser)
  .put(protect, updateUser)
  .delete(protect, authorize('DENTAL_STAFF'), deleteUser); //TODO: not implemented yet

module.exports = router;
