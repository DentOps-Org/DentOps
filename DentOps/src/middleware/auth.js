const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check if auth header exists and starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user to request object
    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
// exports.authorize = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({
//         success: false,
//         message: `User role ${req.user.role} is not authorized to access this route`
//       });
//     }
//     next();
//   };
// };

// middleware/authorize.js  (or update existing middleware/auth.js)
exports.authorize = (...allowed) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const userRole = req.user.role;             // e.g. "DENTAL_STAFF"
    const userSpec = req.user.specialization;   // e.g. "CLINIC_MANAGER" or "DENTIST"

    // allowed contains entries like "DENTAL_STAFF" or "CLINIC_MANAGER"
    const ok = allowed.some(a => {
      if (!a) return false;
      return a === userRole || a === userSpec;
    });

    if (!ok) {
      return res.status(403).json({
        success: false,
        message: `User role ${userRole} is not authorized to access this route`
      });
    }
    next();
  };
};
