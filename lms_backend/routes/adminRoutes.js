const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const courseController = require('../controllers/courseController');
const moduleController = require('../controllers/moduleController');
const lessonController = require('../controllers/lessonController');
const adminStatsController = require('../controllers/adminStatsController');
const analyticsController = require('../controllers/analyticsController');
const deviceController = require('../controllers/deviceController');
const quizController = require('../controllers/quizController');

// All admin routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// admin stats
router.get('/stats', adminStatsController.getStats);

// Device management routes
router.get('/devices', deviceController.getAllDevices);
router.get('/users/:userId/devices', deviceController.getUserDevices);
router.delete('/devices/:id', deviceController.removeDevice);

// Course routes
router.post('/courses', courseController.createCourse);
router.put('/courses/:id', courseController.updateCourse);
router.delete('/courses/:id', courseController.deleteCourse);
router.get('/analytics', analyticsController.getAnalytics);

// Module routes
router.post('/courses/:courseId/modules', moduleController.addModule);
router.put('/modules/reorder', moduleController.reorderModules);
router.put('/modules/:id', moduleController.updateModule);
router.delete('/modules/:id', moduleController.deleteModule);

// Lesson routes
router.post('/modules/:moduleId/lessons', lessonController.addLesson);
router.put('/lessons/reorder', lessonController.reorderLessons);
router.put('/lessons/:id', lessonController.updateLesson);
router.delete('/lessons/:id', lessonController.deleteLesson);

// Quiz reordering route
router.put('/quizzes/reorder', quizController.reorderQuizzes);

// Database synchronization route
router.post('/sync-db', async (req, res) => {
  try {
    const { sequelize } = require('../models/associations');
    
    // 1. Try to add moduleId column to tickets table
    try {
      await sequelize.query('ALTER TABLE tickets ADD COLUMN moduleId INT NULL;');
      console.log('Added moduleId column successfully.');
    } catch (err) {
      // If column already exists, ignore the error
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
    
    // 2. Try to add foreign key constraint for moduleId
    try {
      await sequelize.query('ALTER TABLE tickets ADD CONSTRAINT fk_tickets_moduleId FOREIGN KEY (moduleId) REFERENCES modules(id) ON DELETE SET NULL ON UPDATE CASCADE;');
      console.log('Added foreign key constraint fk_tickets_moduleId successfully.');
    } catch (err) {
      // If constraint already exists, ignore
      if (err.parent && (err.parent.code === 'ER_DUP_KEY' || err.parent.code === 'ER_FK_DUP_NAME' || err.parent.errno === 1022 || err.parent.errno === 1211)) {
        console.log('Foreign key constraint fk_tickets_moduleId already exists.');
      } else {
        throw err;
      }
    }

    res.json({
      success: true,
      message: 'Database schema updated successfully using direct SQL query!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database schema update failed',
      error: error.message
    });
  }
});

module.exports = router;