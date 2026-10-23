const { User, Subscription, Course } = require('../models/associations');
const { Op } = require('sequelize');

exports.getStats = async (req, res) => {
  try {
    const now = new Date();
    const [totalStudents, totalAdmins, totalCourses, activeSubscriptions, revenueResult] = await Promise.all([
      User.count({ where: { role: 'student' } }),
      User.count({ where: { role: 'admin' } }),
      Course.count(),
      Subscription.count({
        where: {
          status: 'active',
          endDate: { [Op.gt]: now }
        }
      }),
      Subscription.sum('amount', {
        where: { 
          status: 'active',
          endDate: { [Op.gt]: now }
        }
      })
    ]);
    
    const totalRevenue = revenueResult || 0;
    
    res.json({
      success: true,
      data: {
        users: {
          total: totalStudents + totalAdmins,
          students: totalStudents,
          admins: totalAdmins
        },
        subscriptions: {
          active: activeSubscriptions
        },
        content: {
          courses: totalCourses
        },
        revenue: {
          total: totalRevenue,
          currency: 'INR'
        }
      }
    });
  } catch (error) {
        res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
