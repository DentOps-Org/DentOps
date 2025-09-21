const mongoose = require('mongoose');

const ClinicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a clinic name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  phone: {
    type: String,
    maxlength: [20, 'Phone number cannot be longer than 20 characters']
  },
  email: {
    type: String,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  website: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual populate with users
ClinicSchema.virtual('users', {
  ref: 'User',
  localField: '_id',
  foreignField: 'clinicId',
  justOne: false
});

// Cascade delete users when a clinic is deleted
ClinicSchema.pre('remove', async function(next) {
  console.log(`Users being removed from clinic ${this._id}`);
  await this.model('User').deleteMany({ clinicId: this._id });
  next();
});

module.exports = mongoose.model('Clinic', ClinicSchema);
