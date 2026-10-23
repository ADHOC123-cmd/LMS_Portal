const jwt = require('jsonwebtoken');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Enforce active session verification for students
    if (decoded.role === 'student' && decoded.deviceFingerprint) {
      const { UserDevice } = require('../models/associations');
      const activeDevice = await UserDevice.findOne({
        where: {
          userId: decoded.id,
          deviceType: decoded.deviceType,
          deviceFingerprint: decoded.deviceFingerprint,
          isActive: true
        }
      });

      if (!activeDevice) {
        console.warn('❌ Session invalidated: Device access has been revoked or modified for user:', decoded.email);
        return res.status(401).json({
          success: false,
          message: 'Session invalid. This device access has been revoked or modified. Please log in again.'
        });
      }
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
    });
  }
};

// Admin only middleware
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.',
    });
  }
};
