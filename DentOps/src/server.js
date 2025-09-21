require("dotenv").config({ path: __dirname + "/../.env", debug: true });

// Set timezone to IST
process.env.TZ = 'Asia/Kolkata';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const connectDB = require('./config/db');
const fs = require("fs");
console.log("Does .env exist?", fs.existsSync(__dirname + "/../.env"));
console.log("Raw env file contents:");
console.log(fs.readFileSync(__dirname + "/../.env", "utf-8"))

console.log('Environment variables loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  MONGO_URI: process.env.MONGO_URI ? '***URI exists***' : 'undefined',
  PORT: process.env.PORT
});

// Connect to database
connectDB();

// Route files
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const appointmentRoutes = require('./routes/appointments');
const inventoryRoutes = require('./routes/inventory');
const recordRoutes = require('./routes/records');
const availabilityRoutes = require('./routes/availability');
const appointmentTypeRoutes = require('./routes/appointmentType');

const app = express();

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Security headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routers
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/records', recordRoutes);
app.use('/availability', availabilityRoutes);
app.use('/appointment-types', appointmentTypeRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('DentOps API is running...');
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
