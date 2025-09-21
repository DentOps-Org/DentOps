# DentOps - Dental Clinic Management System

A comprehensive web-based dental clinic management system that allows patients to book appointments and dental staff to manage schedules, inventory, and patient records.

## Features

### Patient Features
- User registration and authentication
- Book, reschedule, and cancel appointments
- View appointment history and upcoming appointments
- Access personal medical records
- Download medical documents

### Staff Features
- User authentication with role-based access
- Manage patient appointments
- View and manage clinic calendar
- Track and manage inventory
- Upload and manage patient records
- View low stock alerts

## Technology Stack

### Backend
- Node.js (v20.19.4)
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- express-validator for request validation
- multer for file uploads
- helmet for security headers
- cors for cross-origin resource sharing
- morgan for logging

### Frontend
- React.js
- Vite (build tool)
- React Router DOM for routing
- Redux Toolkit for state management
- Tailwind CSS for styling
- Axios for HTTP requests

## Project Structure

```
DentOps/
├── DentOps/                 # Backend
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   └── server.js       # Main server file
│   ├── uploads/            # File uploads directory
│   ├── .env                # Environment variables
│   └── package.json
│
└── DentOps-frontend/       # Frontend
    ├── src/
    │   ├── components/     # React components
    │   │   ├── auth/       # Authentication components
    │   │   ├── patient/    # Patient-specific components
    │   │   └── staff/      # Staff-specific components
    │   ├── pages/          # Page components
    │   ├── redux/          # Redux store and slices
    │   ├── services/       # API services
    │   └── App.jsx         # Main app component
    ├── public/             # Static assets
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js (v20.19.4 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd DentOps
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `DentOps` directory with the following variables:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The backend server will start on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd DentOps-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/logout` - Logout user

### Users
- `GET /api/users/me` - Get current user profile

### Appointments
- `GET /api/appointments` - Get appointments with filters
- `GET /api/appointments/:id` - Get single appointment
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment
- `GET /api/appointments/available` - Get available time slots
- `GET /api/appointments/provider/:providerId` - Get provider calendar

### Inventory
- `GET /api/inventory` - Get inventory items
- `GET /api/inventory/:id` - Get single inventory item
- `POST /api/inventory` - Create new inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item
- `PUT /api/inventory/:id/adjust` - Adjust inventory quantity
- `GET /api/inventory/low-stock` - Get low stock items

### Patient Records
- `GET /api/records` - Get patient records
- `GET /api/records/:id` - Get single record
- `POST /api/records` - Create new record
- `PUT /api/records/:id` - Update record
- `DELETE /api/records/:id` - Delete record
- `PUT /api/records/:id/archive` - Archive record
- `GET /api/records/:id/download` - Download record file

## User Roles

### Patient
- Can book, reschedule, and cancel appointments
- Can view personal medical records
- Can download medical documents

### Dental Staff
- Can manage all appointments
- Can view and manage clinic calendar
- Can track and manage inventory
- Can upload and manage patient records
- Can view low stock alerts

## Features in Detail

### Appointment Management
- Conflict checking to prevent double bookings
- Automatic confirmation for MVP
- Status tracking (Pending, Confirmed, Cancelled, Completed, No Show)
- Time slot availability checking

### Inventory Management
- Track item quantities and reorder thresholds
- Low stock alerts
- Category-based organization
- Quantity adjustment tracking

### Patient Records
- File upload support (PDF, images, documents)
- Record categorization (X-Ray, Note, Prescription, Other)
- Tagging system for easy organization
- Archive functionality

### Security
- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control
- Input validation and sanitization
- Security headers with helmet

## Development

### Backend Development
- Uses nodemon for auto-restart during development
- Morgan for HTTP request logging
- Comprehensive error handling
- Input validation with express-validator

### Frontend Development
- Vite for fast development and building
- Hot module replacement
- Tailwind CSS for utility-first styling
- Redux Toolkit for predictable state management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the repository or contact the development team.