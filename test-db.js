const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

console.log('--- DATABASE CONNECTION DIAGNOSTIC TEST ---');
console.log('Current directory:', __dirname);

// Load environment variables from the root folder or the lms_backend folder
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, 'lms_backend/.env') });

console.log('Loaded Configuration:');
console.log('DB_HOST:', process.env.DB_HOST || 'localhost (default)');
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASS is set:', process.env.DB_PASS ? 'YES' : 'NO');
console.log('JWT_SECRET is set:', process.env.JWT_SECRET ? 'YES' : 'NO');

if (!process.env.DB_NAME || !process.env.DB_USER) {
  console.error('\nERROR: DB_NAME or DB_USER is undefined. Your environment variables are not being loaded correctly!');
  process.exit(1);
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: console.log,
  }
);

async function runTest() {
  try {
    await sequelize.authenticate();
    console.log('\nSUCCESS: Sequelize connected to Hostinger MySQL successfully!');
    
    console.log('Attempting to sync database tables...');
    // We import models to make sure associations are registered during sync test
    require('./lms_backend/models');
    await sequelize.sync({ alter: true });
    console.log('SUCCESS: All database tables synchronized and created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\nCONNECTION ERROR:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runTest();
