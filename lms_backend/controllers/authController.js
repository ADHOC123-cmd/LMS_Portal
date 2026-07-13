const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Subscription, UserDevice } = require('../models/associations');

// Generate JWT Token (Access Token)
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
    { expiresIn: '15m' }
  );
};

// Generate Refresh Token
const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
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
    let refreshToken = null;
    if (role === 'student') {
      refreshToken = generateRefreshToken();
      const refreshTokenExpiresAt = new Date();
      refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 30);

      await UserDevice.create({
        userId: user.id,
        deviceType: finalDeviceType,
        deviceFingerprint: finalDeviceFingerprint,
        deviceName: finalDeviceName,
        ipAddress: ip,
        isActive: true,
        lastLogin: new Date(),
        refreshToken,
        refreshTokenExpiresAt
      });
    }

    // Generate token
    const token = generateToken(user, finalDeviceFingerprint, finalDeviceType);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      refreshToken,
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
        message: 'Email was not registered',
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

    // Generate a fresh refresh token
    const refreshToken = generateRefreshToken();
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 30); // 30 days

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
          // If the IP address matches exactly, we assume it's either the same device
          // (e.g. if cookies/localStorage were cleared) or a device on the same local network,
          // and allow updating the fingerprint automatically.
          if (activeDevice.ipAddress && activeDevice.ipAddress === ip && ip !== 'unknown') {
            activeDevice.deviceFingerprint = finalDeviceFingerprint;
            activeDevice.lastLogin = new Date();
            activeDevice.refreshToken = refreshToken;
            activeDevice.refreshTokenExpiresAt = refreshTokenExpiresAt;
            await activeDevice.save();
          } else {
            return res.status(403).json({
              success: false,
              code: 'DEVICE_LIMIT_EXCEEDED',
              message: `Access denied. You already have a registered ${finalDeviceType} device. Please contact support to authorize this device.`,
            });
          }
        } else {
          // Update lastLogin and update IP address in case it changed
          activeDevice.lastLogin = new Date();
          activeDevice.ipAddress = ip;
          activeDevice.refreshToken = refreshToken;
          activeDevice.refreshTokenExpiresAt = refreshTokenExpiresAt;
          await activeDevice.save();
        }
      } else {
        // Register new device
        await UserDevice.create({
          userId: user.id,
          deviceType: finalDeviceType,
          deviceFingerprint: finalDeviceFingerprint,
          deviceName: finalDeviceName,
          ipAddress: ip,
          isActive: true,
          lastLogin: new Date(),
          refreshToken,
          refreshTokenExpiresAt
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
      refreshToken: (user.role === 'student' || (deviceFingerprint && deviceType)) ? refreshToken : null,
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

// Refresh Access Token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Find the device associated with this active refresh token
    const device = await UserDevice.findOne({
      where: {
        refreshToken,
        isActive: true
      },
      include: [{ model: User, as: 'user' }]
    });

    if (!device || !device.user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please log in again.'
      });
    }

    // Check if refresh token is expired
    if (device.refreshTokenExpiresAt && new Date() > new Date(device.refreshTokenExpiresAt)) {
      // Clear the expired token
      device.refreshToken = null;
      device.refreshTokenExpiresAt = null;
      await device.save();

      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.'
      });
    }

    // Generate new access token
    const newAccessToken = generateToken(device.user, device.deviceFingerprint, device.deviceType);

    // Rotate the refresh token for security
    const newRefreshToken = generateRefreshToken();
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 30); // 30 days expiry

    device.refreshToken = newRefreshToken;
    device.refreshTokenExpiresAt = newExpiresAt;
    device.lastLogin = new Date();
    await device.save();

    res.json({
      success: true,
      token: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

