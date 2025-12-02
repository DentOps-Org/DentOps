const dotenv = require('dotenv');

// Load environment variables FIRST (before anything else)
// In production, Render will set env vars directly, so we skip loading .env file
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: __dirname + '/../.env' });
}

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const connectDB = require('./config/db');

// Connect to database (env vars are now loaded)
connectDB();

// Route files
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const appointmentRoutes = require('./routes/appointments');
const inventoryRoutes = require('./routes/inventory');
const recordRoutes = require('./routes/records');
const availabilityRoutes = require('./routes/availability');
const appointmentTypeRoutes = require('./routes/appointmentType');
const externalApi = require('./services/externalApi');

const app = express();

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Security headers
app.use(helmet());

// Enable CORS
// app.use(cors());
app.use(
  cors({
    origin: [
      "http://localhost:5173",           // Local development
      "https://dentops.vercel.app"   // ← Add your Vercel URL here!
    ],
    credentials: true, // allow cookies/JWT to be sent
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routers
app.use('/auth', authRoutes); // done
app.use('/users', userRoutes); // partial
app.use('/appointments', appointmentRoutes); // done
app.use('/inventory', inventoryRoutes); // done
app.use('/records', recordRoutes); // done
app.use('/availability', availabilityRoutes);// done
app.use('/appointment-types', appointmentTypeRoutes); //done

// EJS rendered pages
app.get('/ejs-landing', (req, res) => {
  res.render('landing', {
    title: 'DentOps - Dental Practice Management'
  });
});

app.get('/about', (req, res) => {
  res.render('about', {
    title: 'About DentOps',
    features: [
      'Easy Appointment Booking',
      'Patient Records Management',
      'Inventory Tracking',
      'Staff Availability Management',
      'Automated Reminders'
    ]
  });
});

// Third-party API endpoint (Health Tips)
app.get('/api/health-tip', async (req, res) => {
  try {
    const result = await externalApi.getDentalTip();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch tip' });
  }
});

// Default route - serves EJS landing page
app.get('/', (req, res) => {
  res.render('landing', {
    title: 'DentOps - Dental Practice Management'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections  TODO: what is this ??
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
