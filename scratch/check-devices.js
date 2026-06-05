const path = require('path');
const { User, UserDevice } = require(path.join(__dirname, '../lms_backend/models/associations'));
const sequelize = require(path.join(__dirname, '../lms_backend/config/database'));

async function run() {
  try {
    await sequelize.authenticate();
    const users = await User.findAll({
      include: [{ model: UserDevice, as: 'devices' }]
    });

    console.log('--- USERS AND REGISTERED DEVICES ---');
    for (const u of users) {
      console.log(`User ID: ${u.id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
      if (u.devices && u.devices.length > 0) {
        console.log('  Devices:');
        for (const d of u.devices) {
          console.log(`    - ID: ${d.id}, Type: ${d.deviceType}, Name: ${d.deviceName}, Active: ${d.isActive}, Fingerprint: ${d.deviceFingerprint}, LastLogin: ${d.lastLogin}`);
        }
      } else {
        console.log('  No devices registered.');
      }
      console.log('------------------------------------');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

run();
