const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserDevice = sequelize.define('UserDevice', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  deviceType: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['mobile', 'desktop']],
    },
  },
  deviceFingerprint: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  deviceName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  refreshToken: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  refreshTokenExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  lastLogin: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'user_devices',
});

module.exports = UserDevice;
