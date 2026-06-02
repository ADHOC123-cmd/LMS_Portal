const { User, Subscription, Course } = require('../models/associations');
const { Op } = require('sequelize');

exports.getAnalytics = async (req, res) => {
  try {
        
    // Get total students
    const totalStudents = await User.count({ where: { role: 'student' } });
        
    // Get total courses
    const totalCourses = await Course.count();
        
    // Get active subscriptions
    const activeSubscriptions = await Subscription.count({
      where: {
        status: 'active',
        endDate: { [Op.gt]: new Date() }
      }
    });
        
    // Get total revenue
    const revenueResult = await Subscription.sum('amount', {
      where: {
        status: 'active',
        endDate: { [Op.gt]: new Date() }
      }
    });
    const totalRevenue = revenueResult || 0;
        
    // Fetch actual monthly revenue and registrations (last 6 months)
    const startOfPeriod = new Date();
    startOfPeriod.setMonth(startOfPeriod.getMonth() - 5);
    startOfPeriod.setDate(1);
    startOfPeriod.setHours(0, 0, 0, 0);

    const subscriptions = await Subscription.findAll({
      where: {
        createdAt: {
          [Op.gte]: startOfPeriod
        }
      }
    });

    const students = await User.findAll({
      where: {
        role: 'student',
        createdAt: {
          [Op.gte]: startOfPeriod
        }
      }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = [];
    const newUsers = [];
    
    for (let i = 5; i >= 0; i--) {
      const targetMonthIndex = (currentMonth - i + 12) % 12;
      const targetYear = (currentMonth - i < 0) ? currentYear - 1 : currentYear;
      const monthName = months[targetMonthIndex];
      
      const subsInMonth = subscriptions.filter(sub => {
        const d = new Date(sub.createdAt);
        return d.getMonth() === targetMonthIndex && d.getFullYear() === targetYear;
      });
      
      const rev = subsInMonth.reduce((sum, sub) => sum + parseFloat(sub.amount || 0), 0);
      
      const studentsInMonth = students.filter(std => {
        const d = new Date(std.createdAt);
        return d.getMonth() === targetMonthIndex && d.getFullYear() === targetYear;
      });
      
      monthlyRevenue.push({
        month: monthName,
        revenue: parseFloat(rev.toFixed(2))
      });
      
      newUsers.push({
        month: monthName,
        users: studentsInMonth.length
      });
    }
    
    // Get popular courses
    const activeSubsForPopularity = await Subscription.findAll({
      where: { status: 'active' },
      attributes: ['courseId'],
      include: [{ model: Course, as: 'course', attributes: ['id', 'title'] }],
      limit: 100
    });
    
    const courseCount = {};
    for (const sub of activeSubsForPopularity) {
      const courseId = sub.courseId;
      courseCount[courseId] = (courseCount[courseId] || 0) + 1;
    }
    
    const popularCourses = Object.entries(courseCount)
      .map(([courseId, count]) => ({
        courseId: parseInt(courseId),
        enrollmentCount: count,
        course: activeSubsForPopularity.find(s => s.courseId == courseId)?.course || null
      }))
      .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
      .slice(0, 5);
    
    res.json({
      success: true,
      data: {
        summary: {
          totalStudents,
          totalCourses,
          activeSubscriptions,
          totalRevenue
        },
        monthlyRevenue,
        newUsers,
        popularCourses,
        completionRate: 0
      }
    });
  } catch (error) {
        res.status(500).json({ 
      success: false, 
      message: error.message,
      stack: error.stack
    });
  }
};
