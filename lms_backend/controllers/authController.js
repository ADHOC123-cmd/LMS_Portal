const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Subscription, UserDevice } = require('../models/associations');

// Generate JWT Token
const generateToken = (user, deviceFingerprint = null, deviceType = null) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      deviceFingerprint,
      deviceType 
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Register User
exports.register = async (req, res) => {
  try {
    const { name, email, password, role = 'student', referralCode, deviceFingerprint, deviceType, deviceName } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password',
      });
    }

    // Generate server-side fallback device details if missing
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const finalDeviceFingerprint = deviceFingerprint || crypto.createHash('sha256').update(`${ip}-${userAgent}`).digest('hex');
    const finalDeviceType = deviceType || (/mobile|android|iphone|ipad/i.test(userAgent) ? 'mobile' : 'desktop');
    const finalDeviceName = deviceName || (userAgent !== 'unknown' ? userAgent.substring(0, 50) : 'Unknown Device');

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle Referral Code logic
    let referredById = null;
    if (referralCode) {
      const referrer = await User.findOne({ where: { referralCode } });
      if (referrer) {
        referredById = referrer.id;
        // Increment their available discounts
        await referrer.increment('availableDiscounts', { by: 1 });
      }
    }

    // Generate unique referral code for the new user
    const newReferralCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      referralCode: newReferralCode,
      referredBy: referredById,
      availableDiscounts: referredById ? 1 : 0
    });

    // Register the initial device
    if (role === 'student') {
      await UserDevice.create({
        userId: user.id,
        deviceType: finalDeviceType,
        deviceFingerprint: finalDeviceFingerprint,
        deviceName: finalDeviceName,
        isActive: true,
        lastLogin: new Date()
      });
    }

    // Generate token
    const token = generateToken(user, finalDeviceFingerprint, finalDeviceType);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode,
        availableDiscounts: user.availableDiscounts,
        coins: user.coins
      },
    });
  } catch (error) {
        res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password, deviceFingerprint, deviceType, deviceName } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate server-side fallback device details if missing
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const finalDeviceFingerprint = deviceFingerprint || crypto.createHash('sha256').update(`${ip}-${userAgent}`).digest('hex');
    const finalDeviceType = deviceType || (/mobile|android|iphone|ipad/i.test(userAgent) ? 'mobile' : 'desktop');
    const finalDeviceName = deviceName || (userAgent !== 'unknown' ? userAgent.substring(0, 50) : 'Unknown Device');

    // Validate device if user is a student or device details are supplied
    if (user.role === 'student' || (deviceFingerprint && deviceType)) {
      // Check if there is an active device of the same type
      const activeDevice = await UserDevice.findOne({
        where: {
          userId: user.id,
          deviceType: finalDeviceType,
          isActive: true
        }
      });

      if (activeDevice) {
        // Compare fingerprints
        if (activeDevice.deviceFingerprint !== finalDeviceFingerprint) {
          return res.status(403).json({
            success: false,
            code: 'DEVICE_LIMIT_EXCEEDED',
            message: `Access denied. You already have a registered ${finalDeviceType} device. Please contact support to authorize this device.`,
          });
        } else {
          // Update lastLogin
          activeDevice.lastLogin = new Date();
          await activeDevice.save();
        }
      } else {
        // Register new device
        await UserDevice.create({
          userId: user.id,
          deviceType: finalDeviceType,
          deviceFingerprint: finalDeviceFingerprint,
          deviceName: finalDeviceName,
          isActive: true,
          lastLogin: new Date()
        });
      }
    }

    // Backfill referral code if missing for old users
    if (!user.referralCode) {
      const newReferralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      user.referralCode = newReferralCode;
      await user.save();
    }

    // Generate token
    const token = generateToken(user, finalDeviceFingerprint, finalDeviceType);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode,
        availableDiscounts: user.availableDiscounts,
        coins: user.coins
      },
    });
  } catch (error) {
        res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get Current User Profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
        res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
