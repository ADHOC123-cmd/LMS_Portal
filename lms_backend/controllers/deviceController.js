const { UserDevice, User } = require('../models/associations');
const { Op } = require('sequelize');

// Get all devices (Admin/Support only)
exports.getAllDevices = async (req, res) => {
  try {
    const { search, deviceType } = req.query;

    const whereClause = {};
    if (deviceType) {
      whereClause.deviceType = deviceType;
    }

    const userWhereClause = {};
    if (search) {
      userWhereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const devices = await UserDevice.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          where: Object.keys(userWhereClause).length > 0 ? userWhereClause : undefined,
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      order: [['lastLogin', 'DESC']]
    });

    res.json({
      success: true,
      data: devices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get devices for a specific user
exports.getUserDevices = async (req, res) => {
  try {
    const { userId } = req.params;

    const devices = await UserDevice.findAll({
      where: { userId },
      order: [['lastLogin', 'DESC']]
    });

    res.json({
      success: true,
      data: devices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Remove a device record
exports.removeDevice = async (req, res) => {
  try {
    const { id } = req.params;

    const device = await UserDevice.findByPk(id);
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    await device.destroy();

    res.json({
      success: true,
      message: 'Device authorization successfully removed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
