const { sequelize } = require('./models/associations');

async function syncDatabase() {
  try {
    console.log('--- DATABASE SYNC SCRIPT (DIRECT SQL ALTER) ---');
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    console.log('Altering tickets table (adding moduleId)...');
    
    // 1. Try to add moduleId column to tickets table
    try {
      await sequelize.query('ALTER TABLE tickets ADD COLUMN moduleId INT NULL;');
      console.log('Added moduleId column successfully.');
    } catch (err) {
      if (err.parent && (err.parent.code === 'ER_DUP_FIELDNAME' || err.parent.errno === 1060)) {
        console.log('moduleId column already exists.');
      } else {
        throw err;
      }
    }

    // 2. Try to add category column to courses table
    try {
      await sequelize.query("ALTER TABLE courses ADD COLUMN category VARCHAR(255) DEFAULT 'development';");
      console.log('Added category column to courses successfully.');
    } catch (err) {
      if (err.parent && (err.parent.code === 'ER_DUP_FIELDNAME' || err.parent.errno === 1060)) {
        console.log('category column already exists.');
      } else {
        throw err;
      }
    }

    // 3. Try to add duration column to courses table
    try {
      await sequelize.query("ALTER TABLE courses ADD COLUMN duration INT DEFAULT 20;");
      console.log('Added duration column to courses successfully.');
    } catch (err) {
      if (err.parent && (err.parent.code === 'ER_DUP_FIELDNAME' || err.parent.errno === 1060)) {
        console.log('duration column already exists.');
      } else {
        throw err;
      }
    }

    // 4. Try to add level column to courses table
    try {
      await sequelize.query("ALTER TABLE courses ADD COLUMN level VARCHAR(255) DEFAULT 'beginner';");
      console.log('Added level column to courses successfully.');
    } catch (err) {
      if (err.parent && (err.parent.code === 'ER_DUP_FIELDNAME' || err.parent.errno === 1060)) {
        console.log('level column already exists.');
      } else {
        throw err;
      }
    }

    // 5. Try to add ipAddress column to user_devices table
    try {
      await sequelize.query("ALTER TABLE user_devices ADD COLUMN ipAddress VARCHAR(255) NULL;");
      console.log('Added ipAddress column to user_devices successfully.');
    } catch (err) {
      if (err.parent && (err.parent.code === 'ER_DUP_FIELDNAME' || err.parent.errno === 1060)) {
        console.log('ipAddress column already exists.');
      } else {
        throw err;
      }
    }

    // 6. Try to add refreshToken column to user_devices table
    try {
      await sequelize.query("ALTER TABLE user_devices ADD COLUMN refreshToken VARCHAR(500) NULL;");
      console.log('Added refreshToken column to user_devices successfully.');
    } catch (err) {
      if (err.parent && (err.parent.code === 'ER_DUP_FIELDNAME' || err.parent.errno === 1060)) {
        console.log('refreshToken column already exists.');
      } else {
        throw err;
      }
    }

    // 7. Try to add refreshTokenExpiresAt column to user_devices table
    try {
      await sequelize.query("ALTER TABLE user_devices ADD COLUMN refreshTokenExpiresAt DATETIME NULL;");
      console.log('Added refreshTokenExpiresAt column to user_devices successfully.');
    } catch (err) {
      if (err.parent && (err.parent.code === 'ER_DUP_FIELDNAME' || err.parent.errno === 1060)) {
        console.log('refreshTokenExpiresAt column already exists.');
      } else {
        throw err;
      }
    }

    
    // 2. Try to add foreign key constraint for moduleId
    try {
      await sequelize.query('ALTER TABLE tickets ADD CONSTRAINT fk_tickets_moduleId FOREIGN KEY (moduleId) REFERENCES modules(id) ON DELETE SET NULL ON UPDATE CASCADE;');
      console.log('Added foreign key constraint fk_tickets_moduleId successfully.');
    } catch (err) {
      if (err.parent && (err.parent.code === 'ER_DUP_KEY' || err.parent.code === 'ER_FK_DUP_NAME' || err.parent.errno === 1022 || err.parent.errno === 1211)) {
        console.log('Foreign key constraint fk_tickets_moduleId already exists.');
      } else {
        throw err;
      }
    }

    console.log('SUCCESS: Database schema has been updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('ERROR: Database schema update failed:', error);
    process.exit(1);
  }
}

syncDatabase();
