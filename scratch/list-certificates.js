const path = require('path');
const { Certificate, User, Course } = require(path.join(__dirname, '../lms_backend/models/associations'));
const sequelize = require(path.join(__dirname, '../lms_backend/config/database'));

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const certificates = await Certificate.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Course, as: 'course', attributes: ['id', 'title'] }
      ]
    });

    console.log('\n--- ISSUED CERTIFICATES ---');
    if (certificates.length === 0) {
      console.log('No certificates found in the database.');
    } else {
      for (const cert of certificates) {
        console.log(`ID: ${cert.id}`);
        console.log(`Student Name: ${cert.user ? cert.user.name : 'N/A'} (ID: ${cert.userId}, Email: ${cert.user ? cert.user.email : 'N/A'})`);
        console.log(`Course: ${cert.course ? cert.course.title : 'N/A'} (ID: ${cert.courseId})`);
        console.log(`Number: ${cert.certificateNumber}`);
        console.log(`Code: ${cert.verificationCode}`);
        console.log(`Score: ${cert.quizScore}%`);
        console.log(`Issue Date: ${cert.issueDate}`);
        console.log('------------------------------------');
      }
    }
  } catch (error) {
    console.error('Error running query:', error);
  } finally {
    await sequelize.close();
  }
}

run();
