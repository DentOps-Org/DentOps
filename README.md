# DentOps - Dental Clinic Management System

[![GitHub Repository](https://img.shields.io/badge/GitHub-DentOps-blue?style=flat&logo=github)](https://github.com/YOUR-USERNAME/DentOps)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A comprehensive full-stack web application for dental clinic management that streamlines appointment scheduling, patient record management, inventory tracking, and staff coordination. Built with modern technologies for a seamless user experience.

## 🌟 Features

### For Patients
- **User Authentication** - Secure registration and login system
- **Appointment Management** - Book, reschedule, and cancel appointments
- **Appointment History** - View past and upcoming appointments
- **Medical Records Access** - Access personal medical documents
- **Health Tips** - Get dental health tips from third-party API

### For Dental Staff
- **Role-Based Access Control** - Secure access based on user roles
- **Appointment Management** - Confirm, update, and manage patient appointments
- **Available Slots** - View and manage dentist availability
- **Inventory Tracking** - Monitor supplies with low-stock alerts
- **Patient Records** - Upload and manage patient medical records
- **Staff Availability** - Manage dentist schedules and availability windows

---

## 🛠️ Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | v20.19.4+ | Runtime environment |
| **Express.js** | ^5.1.0 | Web application framework |
| **MongoDB** | ^8.18.0 | Database (with Mongoose ODM) |
| **JWT** | ^9.0.2 | Authentication tokens |
| **bcryptjs** | ^3.0.2 | Password hashing |
| **express-validator** | ^7.2.1 | Request validation |
| **multer** | ^2.0.2 | File upload handling |
| **helmet** | ^8.1.0 | Security headers |
| **cors** | ^2.8.5 | Cross-origin resource sharing |
| **morgan** | ^1.10.1 | HTTP request logging |
| **EJS** | ^3.1.10 | Server-side templating |
| **axios** | ^1.11.0 | HTTP client for external APIs |
| **express-rate-limit** | ^8.1.0 | Rate limiting middleware |
| **dotenv** | ^17.2.2 | Environment variable management |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React.js** | ^19.1.1 | UI framework |
| **Vite** | ^7.1.2 | Build tool & dev server |
| **React Router DOM** | ^7.8.2 | Client-side routing |
| **Redux Toolkit** | ^2.9.0 | State management |
| **Tailwind CSS** | ^4.1.13 | Utility-first CSS framework |
| **axios** | ^1.11.0 | HTTP client |
| **ESLint** | ^9.33.0 | Code linting |

### Development Tools
- **nodemon** (^3.1.10) - Auto-restart server during development
- **@vitejs/plugin-react** (^5.0.0) - React support for Vite

---

## 📁 Project Structure

```
DentOps/
├── DentOps/                          # Backend Application
│   ├── src/
│   │   ├── config/                   # Configuration files
│   │   │   └── db.js                 # MongoDB connection
│   │   ├── controllers/              # Request handlers
│   │   │   ├── auth.js               # Authentication logic
│   │   │   ├── users.js              # User management
│   │   │   ├── appointments.js       # Appointment logic
│   │   │   ├── availability.js       # Staff availability
│   │   │   ├── appointmentType.js    # Appointment types
│   │   │   ├── inventory.js          # Inventory management
│   │   │   └── records.js            # Patient records
│   │   ├── middleware/               # Custom middleware
│   │   │   └── auth.js               # Auth & authorization middleware
│   │   ├── models/                   # Mongoose schemas
│   │   │   ├── User.js               # User model
│   │   │   ├── Appointment.js        # Appointment model
│   │   │   ├── Availability.js       # Availability model
│   │   │   ├── AppointmentType.js    # Appointment type model
│   │   │   ├── Inventory.js          # Inventory model
│   │   │   └── Record.js             # Patient record model
│   │   ├── routes/                   # API route definitions
│   │   │   ├── auth.js               # Authentication routes
│   │   │   ├── users.js              # User routes
│   │   │   ├── appointments.js       # Appointment routes
│   │   │   ├── availability.js       # Availability routes
│   │   │   ├── appointmentType.js    # Appointment type routes
│   │   │   ├── inventory.js          # Inventory routes
│   │   │   └── records.js            # Record routes
│   │   ├── services/                 # External services
│   │   │   └── externalApi.js        # Third-party API integration
│   │   ├── views/                    # EJS templates
│   │   │   ├── landing.ejs           # Landing page
│   │   │   └── about.ejs             # About page
│   │   ├── utils/                    # Utility functions
│   │   └── server.js                 # Main server file
│   ├── uploads/                      # Uploaded files directory
│   ├── public/                       # Static assets
│   ├── .env                          # Environment variables (not in repo)
│   ├── .gitignore                    # Git ignore rules
│   └── package.json                  # Dependencies & scripts
│
└── DentOps-frontend/                 # Frontend Application
    ├── src/
    │   ├── api/                      # API configuration
    │   │   └── axios.js              # Axios instance
    │   ├── components/               # Reusable components
    │   │   ├── auth/                 # Auth components
    │   │   ├── patient/              # Patient components
    │   │   ├── staff/                # Staff components
    │   │   └── shared/               # Shared components
    │   ├── pages/                    # Page components
    │   │   ├── Landing/              # Landing page
    │   │   ├── Auth/                 # Login/Register
    │   │   ├── Patient/              # Patient dashboard
    │   │   └── Staff/                # Staff dashboard
    │   ├── redux/                    # Redux state management
    │   │   ├── store.js              # Redux store
    │   │   └── slices/               # Redux slices
    │   ├── router/                   # Routing configuration
    │   │   └── AppRouter.jsx         # Main router
    │   ├── services/                 # API services
    │   │   └── api.js                # API calls
    │   ├── utils/                    # Utility functions
    │   ├── App.jsx                   # Main app component
    │   ├── main.jsx                  # App entry point
    │   └── index.css                 # Global styles
    ├── public/                       # Static assets
    ├── .env.development              # Development environment
    ├── .env.production               # Production environment
    ├── .gitignore                    # Git ignore rules
    ├── package.json                  # Dependencies & scripts
    ├── vite.config.js                # Vite configuration
    ├── tailwind.config.js            # Tailwind configuration
    └── eslint.config.js              # ESLint configuration
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v20.19.4 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - Local installation or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download](https://git-scm.com/)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/DentOps.git
cd DentOps
```

#### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd DentOps
npm install
```

Create a `.env` file in the `DentOps` directory:

```bash
# Create .env file (Windows)
type nul > .env

# Or on macOS/Linux
touch .env
```

Add the following environment variables to `.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGO_URI=mongodb://localhost:27017/dentops
# Or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/dentops?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d
```

> **Security Note:** Change `JWT_SECRET` to a strong random string in production.

#### 3. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd ../DentOps-frontend
npm install
```

Create environment files if needed (or use existing ones):

**`.env.development`**:
```env
VITE_API_URL=http://localhost:5000
```

**`.env.production`**:
```env
VITE_API_URL=https://your-production-backend-url.com
```

---

## ▶️ Running the Project

### Development Mode

#### Start Backend Server

```bash
# From DentOps directory
cd DentOps
npm run dev
```

The backend server will start on `http://localhost:5000`

**Available endpoints:**
- EJS Landing Page: `http://localhost:5000/`
- EJS About Page: `http://localhost:5000/about`
- Health Tip API: `http://localhost:5000/api/health-tip`
- API Routes: `http://localhost:5000/*` (see API documentation below)

#### Start Frontend Server

```bash
# From DentOps-frontend directory
cd DentOps-frontend
npm run dev
```

The frontend will start on `http://localhost:5173` (or the next available port)

### Production Mode

#### Backend

```bash
cd DentOps
npm start
```

#### Frontend

```bash
cd DentOps-frontend
npm run build      # Build for production
npm run preview    # Preview production build locally
```

---

## 📡 API Documentation

### Base URL
- **Development:** `http://localhost:5000`
- **Production:** `https://your-production-url.com`

### Authentication

All authenticated routes require a JWT token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

#### Auth Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/auth/register` | Register new user | ❌ | - |
| POST | `/auth/login` | Login user | ❌ | - |
| GET | `/auth/me` | Get current user | ✅ | Any |
| GET | `/auth/logout` | Logout user | ✅ | Any |

**Register Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "PATIENT"
}
```

**Login Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

---

### Users

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/users` | Get users (filter by email/role) | ✅ | CLINIC_MANAGER |
| GET | `/users/providers` | Get all dental staff/providers | ✅ | Any |

---

### Appointments

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/appointments` | Get all appointments (filtered) | ✅ | Any |
| GET | `/appointments/requests` | Get pending appointment requests | ✅ | CLINIC_MANAGER |
| GET | `/appointments/available` | Get available time slots | ✅ | CLINIC_MANAGER |
| GET | `/appointments/:id` | Get appointment by ID | ✅ | Any |
| POST | `/appointments` | Create appointment request | ✅ | PATIENT |
| POST | `/appointments/:id/confirm` | Confirm pending appointment | ✅ | CLINIC_MANAGER |
| POST | `/appointments/:id/complete` | Mark appointment as complete | ✅ | DENTIST |
| PATCH | `/appointments/:id/cancel` | Cancel appointment | ✅ | CLINIC_MANAGER |
| PUT | `/appointments/:id` | Update appointment | ✅ | CLINIC_MANAGER |
| DELETE | `/appointments/:id` | Delete appointment | ✅ | CLINIC_MANAGER |

**Create Appointment Request Body:**
```json
{
  "appointmentTypeId": "64a1b2c3d4e5f6a7b8c9d0e1",
  "requestedDate": "2024-12-15",
  "notes": "Patient has tooth pain"
}
```

**Get Available Slots Query Params:**
```
GET /appointments/available?dentalStaffId=xxx&date=2024-12-15&appointmentTypeId=yyy
```

---

### Appointment Types

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/appointment-types` | Get all appointment types | ✅ | Any |
| GET | `/appointment-types/:id` | Get appointment type by ID | ✅ | Any |
| POST | `/appointment-types` | Create appointment type | ✅ | CLINIC_MANAGER |
| PUT | `/appointment-types/:id` | Update appointment type | ✅ | CLINIC_MANAGER |
| DELETE | `/appointment-types/:id` | Delete appointment type | ✅ | CLINIC_MANAGER |

**Create Appointment Type Request Body:**
```json
{
  "name": "Cleaning",
  "durationMinutes": 30,
  "description": "Regular teeth cleaning",
  "isActive": true
}
```

---

### Availability

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/availability/:dentalStaffId` | Get staff availability | ✅ | Any |
| GET | `/availability/:dentalStaffId/free-windows` | Get free time windows | ✅ | Any |
| POST | `/availability` | Create availability slot | ✅ | CLINIC_MANAGER |
| PUT | `/availability/:id` | Update availability slot | ✅ | CLINIC_MANAGER |
| DELETE | `/availability/:id` | Delete availability slot | ✅ | CLINIC_MANAGER |

**Create Availability Request Body:**
```json
{
  "dentalStaffId": "64a1b2c3d4e5f6a7b8c9d0e1",
  "weekday": 1,
  "startTimeOfDay": "09:00",
  "endTimeOfDay": "17:00"
}
```

**Weekday values:** 0 = Sunday, 1 = Monday, ..., 6 = Saturday

---

### Inventory

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/inventory` | Get all inventory items | ✅ | CLINIC_MANAGER |
| GET | `/inventory/low-stock` | Get low stock items | ✅ | CLINIC_MANAGER |
| GET | `/inventory/:id` | Get inventory item by ID | ✅ | CLINIC_MANAGER |
| POST | `/inventory` | Create inventory item | ✅ | CLINIC_MANAGER |
| PUT | `/inventory/:id` | Update inventory item | ✅ | CLINIC_MANAGER |
| PUT | `/inventory/:id/adjust` | Adjust inventory quantity | ✅ | CLINIC_MANAGER |
| DELETE | `/inventory/:id` | Delete inventory item | ✅ | CLINIC_MANAGER |

**Create Inventory Item Request Body:**
```json
{
  "name": "Dental Floss",
  "category": "Hygiene",
  "quantity": 100,
  "reorderThreshold": 20,
  "price": 2.50,
  "supplier": "DentalSupply Co."
}
```

**Adjust Quantity Request Body:**
```json
{
  "delta": -5
}
```

---

### Patient Records

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/records` | Get patient records | ✅ | Any |
| GET | `/records/:id` | Get record by ID | ✅ | Any |
| POST | `/records` | Create new record | ✅ | DENTIST |
| PUT | `/records/:id` | Update record | ✅ | DENTIST |
| DELETE | `/records/:id` | Delete record | ✅ | DENTIST |

**Create Record Request Body:**
```json
{
  "patientId": "64a1b2c3d4e5f6a7b8c9d0e1",
  "title": "X-Ray Results",
  "type": "X-Ray",
  "description": "Routine checkup x-ray",
  "tags": ["routine", "checkup"]
}
```

---

### External API

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/health-tip` | Get random dental health tip | ❌ |

**Response:**
```json
{
  "success": true,
  "tip": "Brush your teeth twice a day..."
}
```

---

## 👥 User Roles

### PATIENT
- Create and manage own appointments
- View personal medical records
- Update personal profile

### CLINIC_MANAGER
All patient permissions, plus:
- Confirm and manage appointment requests
- Schedule and assign appointments
- Cancel and delete appointments
- Manage dentist availability schedules
- Create and manage appointment types
- Track and manage inventory
- View low stock alerts
- Search and view user information

### DENTIST
All patient permissions, plus:
- Mark appointments as complete
- Create, update, and delete patient medical records
- View assigned appointments

---

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs with salt rounds for password security
- **Role-Based Access Control** - Middleware-enforced permissions
- **Input Validation** - express-validator for request validation
- **Security Headers** - Helmet.js for HTTP security headers
- **CORS Protection** - Configured cross-origin resource sharing
- **Rate Limiting** - Protection against brute-force attacks
- **Environment Variables** - Sensitive data stored in .env files

---

## 🧪 Testing

### Backend Testing

```bash
cd DentOps
npm test
```

### Frontend Testing

```bash
cd DentOps-frontend
npm test
```

> **Note:** Test suite is currently being developed.

---

## 🌐 Deployment

### Backend Deployment (Render/Heroku)

1. Set environment variables in hosting platform
2. Ensure `NODE_ENV=production`
3. Configure MongoDB Atlas connection string
4. Deploy using platform-specific instructions

### Frontend Deployment (Vercel/Netlify)

1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Set `VITE_API_URL` to production backend URL
3. Deploy the `dist` folder

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add amazing feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request

### Coding Standards
- Follow existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features

---

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Third-Party APIs** - Health tips provided by external dental health API
- **Open Source Libraries** - All the amazing npm packages that make this possible
- **Contributors** - Thanks to all contributors who help improve this project

---

## 🔄 Version History

- **v1.0.0** (2024) - Initial release
  - User authentication and authorization
  - Appointment management system
  - Inventory tracking
  - Patient records management
  - Staff availability scheduling

---

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Made with ❤️ by the DentOps Team**

---
