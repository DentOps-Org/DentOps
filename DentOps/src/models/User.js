const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  role: {
    type: String,
    enum: ['DENTAL_STAFF', 'PATIENT'],
    default: 'PATIENT'
  },
  specialization: {
    type: String,
    enum: ['DENTIST', 'CLINIC_MANAGER', null],
    default: null
  },
  phone: {
    type: String,
    maxlength: [11, 'Phone number cannot be longer than 11 characters']
  },
  dob: { type: Date },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  createdAt: { type: Date, default: Date.now }
});


// 🧠 Middleware: Only require specialization if role is DENTAL_STAFF
UserSchema.pre('validate', function(next) {
  if (this.role === 'PATIENT') {
    this.specialization = null; // clear it for patients
  } else if (this.role === 'DENTAL_STAFF' && !this.specialization) {
    this.invalidate('specialization', 'Specialization is required for dental staff');
  }
  next();
});


// 🔐 Encrypt password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next(); // skip rehashing if password unchanged

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


// 🔑 JWT
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// 🔍 Compare passwords
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
