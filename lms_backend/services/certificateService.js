const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { Certificate, User, Course } = require('../models/associations');

// Generate unique certificate number
const generateCertificateNumber = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `LMS-${timestamp}-${random}`;
};

// Generate verification code
const generateVerificationCode = () => {
  return Math.random().toString(36).substring(2, 15).toUpperCase();
};

// Create certificate in database
exports.createCertificate = async (userId, courseId, quizScore) => {
  try {
    // Check if certificate already exists
    const existing = await Certificate.findOne({
      where: { userId, courseId }
    });
    
    if (existing) {
      return existing;
    }
    
    const certificateNumber = generateCertificateNumber();
    const verificationCode = generateVerificationCode();
    
    const certificate = await Certificate.create({
      userId,
      courseId,
      certificateNumber,
      verificationCode,
      quizScore,
      issueDate: new Date(),
      isVerified: true
    });
    
    return certificate;
  } catch (error) {
    console.error('Create certificate error:', error);
    throw error;
  }
};

// Generate PDF certificate
exports.generatePDF = async (certificateId) => {
  try {
    const certificate = await Certificate.findByPk(certificateId, {
      include: [
        { model: User, as: 'user' },
        { model: Course, as: 'course' }
      ]
    });
    
    if (!certificate) {
      throw new Error('Certificate not found');
    }
    
    // Create PDF with no default margins so the background fits perfectly
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 0
    });
    
    // Create filename
    const filename = `certificate_${certificate.certificateNumber}.pdf`;
    const filepath = path.join(__dirname, '../uploads/certificates/', filename);
    
    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Create write stream
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);
    
    // Add Background Image
    const bgPath = path.join(__dirname, '../assets/certificate-background.png');
    if (fs.existsSync(bgPath)) {
      doc.image(bgPath, 0, 0, { width: doc.page.width, height: doc.page.height });
    }
    
    // Add Logo Image
    const logoPath = path.join(__dirname, '../assets/logo.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 100, 50, { width: 90, height: 90 });
    }
    
    // Add header text centered on the page
    doc.fontSize(46)
       .font('Helvetica-Bold')
       .fillColor('#0d3a78')
       .text('CERTIFICATE', 0, 55, { align: 'center', width: doc.page.width });
    
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .fillColor('#0d3a78')
       .text('OF COMPLETION', 0, 105, { characterSpacing: 4, align: 'center', width: doc.page.width });
    
    // Add presenter subtitle
    doc.fontSize(16)
       .font('Helvetica')
       .fillColor('#333333')
       .text('This certificate is proudly presented to', 0, 195, { align: 'center' });
    
    // Add student name (large, bold, elegant)
    doc.fontSize(38)
       .font('Helvetica-Bold')
       .fillColor('#111111')
       .text(certificate.user.name, 0, 240, { align: 'center' });
    
    // Add horizontal line under name
    doc.moveTo(doc.page.width / 2 - 225, 295)
       .lineTo(doc.page.width / 2 + 225, 295)
       .strokeColor('#0d3a78')
       .lineWidth(2)
       .stroke();
    
    // Add course completion text
    doc.fontSize(14)
       .font('Helvetica')
       .fillColor('#555555')
       .text('For successfully completing the comprehensive training program in', 0, 320, { align: 'center' })
       .font('Helvetica-Bold')
       .fillColor('#111111')
       .text(`"${certificate.course.title}"`, 0, 350, { align: 'center' })
       .font('Helvetica')
       .fillColor('#555555')
       .text('on our Learning Management Portal, demonstrating excellence in all modules.', 0, 380, { align: 'center' });
    
    // Add signature block at the bottom
    const sigLineY = 475;
    doc.moveTo(doc.page.width / 2 - 80, sigLineY)
       .lineTo(doc.page.width / 2 + 80, sigLineY)
       .strokeColor('#0d3a78')
       .lineWidth(1)
       .stroke();
       
    const sigPath = path.join(__dirname, '../assets/signature.png');
    if (fs.existsSync(sigPath)) {
      doc.image(sigPath, doc.page.width / 2 - 60, sigLineY - 45, { width: 120 });
    }
       
    doc.fontSize(13)
       .font('Helvetica-Bold')
       .fillColor('#111111')
       .text('Daniel Benjamin', 0, sigLineY + 10, { align: 'center' })
       .fontSize(10)
       .font('Helvetica')
       .fillColor('#666666')
       .text('Project director', 0, sigLineY + 26, { align: 'center' });
    
    // Add verification block in bottom left
    const metaY = 525;
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#373737')
       .text(`Certificate No: ${certificate.certificateNumber}`, 50, metaY)
       .text(`Verification Code: ${certificate.verificationCode}`, 50, metaY + 11)
       .text(`Issue Date: ${new Date(certificate.issueDate).toLocaleDateString()}`, 50, metaY + 22);
    
    if (certificate.quizScore !== null && certificate.quizScore !== undefined) {
      doc.text(`Final Score: ${certificate.quizScore}%`, 50, metaY + 33);
    }
    
    // Finalize PDF
    doc.end();
    
    // Wait for stream to finish
    await new Promise((resolve) => {
      stream.on('finish', resolve);
    });
    
    // Update certificate with PDF path
    await certificate.update({ pdfPath: filepath });
    
    return { filepath, filename };
  } catch (error) {
    console.error('Generate PDF error:', error);
    throw error;
  }
};

// Verify certificate by verification code
exports.verifyCertificate = async (verificationCode) => {
  try {
    const certificate = await Certificate.findOne({
      where: { verificationCode },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Course, as: 'course', attributes: ['id', 'title'] }
      ]
    });
    
    if (!certificate) {
      return { valid: false, message: 'Certificate not found' };
    }
    
    return {
      valid: true,
      certificate: {
        certificateNumber: certificate.certificateNumber,
        studentName: certificate.user.name,
        courseTitle: certificate.course.title,
        issueDate: certificate.issueDate,
        score: certificate.quizScore
      }
    };
  } catch (error) {
    console.error('Verify certificate error:', error);
    throw error;
  }
};