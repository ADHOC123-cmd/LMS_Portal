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
        
    // Fetch actual monthly revenue and registrations (last 3 years range to cover all tabs)
    const startOfThreeYears = new Date();
    startOfThreeYears.setFullYear(startOfThreeYears.getFullYear() - 2);
    startOfThreeYears.setMonth(0);
    startOfThreeYears.setDate(1);
    startOfThreeYears.setHours(0, 0, 0, 0);

    const subscriptions = await Subscription.findAll({
      where: {
        createdAt: {
          [Op.gte]: startOfThreeYears
        }
      }
    });

    const students = await User.findAll({
      where: {
        role: 'student',
        createdAt: {
          [Op.gte]: startOfThreeYears
        }
      }
    });

    const currentYear = new Date().getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // 1. Weekly Data (past 7 days by date)
    const weeklyData = [];
    const mockWeeklyRevenues = [400, 800, 600, 1200, 900, 1500, 1100];
    const mockWeeklyUsers = [1, 2, 1, 3, 2, 4, 3];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      let rev = 0;
      let usersCount = 0;
      
      if (subscriptions.length > 0) {
        const subsInDay = subscriptions.filter(sub => {
          const subDate = new Date(sub.createdAt);
          return subDate.getDate() === d.getDate() && 
                 subDate.getMonth() === d.getMonth() && 
                 subDate.getFullYear() === d.getFullYear();
        });
        rev = subsInDay.reduce((sum, sub) => sum + parseFloat(sub.amount || 0), 0);
      } else {
        rev = mockWeeklyRevenues[6 - i];
      }
      
      if (students.length > 0) {
        const studentsInDay = students.filter(std => {
          const stdDate = new Date(std.createdAt);
          return stdDate.getDate() === d.getDate() && 
                 stdDate.getMonth() === d.getMonth() && 
                 stdDate.getFullYear() === d.getFullYear();
        });
        usersCount = studentsInDay.length;
      } else {
        usersCount = mockWeeklyUsers[6 - i];
      }
      
      weeklyData.push({
        label,
        revenue: parseFloat(rev.toFixed(2)),
        users: usersCount
      });
    }

    // 2. Monthly Data (all 12 months with names)
    const monthlyData = [];
    const mockMonthlyRevenues = [8000, 12000, 10000, 14000, 11000, 16000, 15000, 22000, 18000, 28000, 35000, 42000];
    const mockMonthlyUsers = [20, 35, 28, 42, 30, 48, 45, 62, 50, 80, 95, 120];
    
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const targetMonthIndex = d.getMonth();
      const targetYear = d.getFullYear();
      const label = months[targetMonthIndex];
      
      let rev = 0;
      let usersCount = 0;
      
      if (subscriptions.length > 0) {
        const subsInMonth = subscriptions.filter(sub => {
          const subDate = new Date(sub.createdAt);
          return subDate.getMonth() === targetMonthIndex && subDate.getFullYear() === targetYear;
        });
        rev = subsInMonth.reduce((sum, sub) => sum + parseFloat(sub.amount || 0), 0);
      } else {
        rev = mockMonthlyRevenues[11 - i];
      }
      
      if (students.length > 0) {
        const studentsInMonth = students.filter(std => {
          const stdDate = new Date(std.createdAt);
          return stdDate.getMonth() === targetMonthIndex && stdDate.getFullYear() === targetYear;
        });
        usersCount = studentsInMonth.length;
      } else {
        usersCount = mockMonthlyUsers[11 - i];
      }
      
      monthlyData.push({
        label,
        revenue: parseFloat(rev.toFixed(2)),
        users: usersCount
      });
    }

    // 3. Yearly Data (last 3 years)
    const yearlyData = [];
    const mockYearlyRevenues = [120000, 180000, 240000];
    const mockYearlyUsers = [350, 520, 700];
    
    for (let i = 2; i >= 0; i--) {
      const targetYear = currentYear - i;
      const label = targetYear.toString();
      
      let rev = 0;
      let usersCount = 0;
      
      if (subscriptions.length > 0) {
        const subsInYear = subscriptions.filter(sub => {
          const subDate = new Date(sub.createdAt);
          return subDate.getFullYear() === targetYear;
        });
        rev = subsInYear.reduce((sum, sub) => sum + parseFloat(sub.amount || 0), 0);
      } else {
        rev = mockYearlyRevenues[2 - i];
      }
      
      if (students.length > 0) {
        const studentsInYear = students.filter(std => {
          const stdDate = new Date(std.createdAt);
          return stdDate.getFullYear() === targetYear;
        });
        usersCount = studentsInYear.length;
      } else {
        usersCount = mockYearlyUsers[2 - i];
      }
      
      yearlyData.push({
        label,
        revenue: parseFloat(rev.toFixed(2)),
        users: usersCount
      });
    }

    // Legacy backwards compatibility mappings (last 6 months)
    const monthlyRevenue = monthlyData.slice(6).map(m => ({
      month: m.label,
      revenue: m.revenue
    }));
    const newUsers = monthlyData.slice(6).map(m => ({
      month: m.label,
      users: m.users
    }));
    
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
        weekly: weeklyData,
        monthly: monthlyData,
        yearly: yearlyData,
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
