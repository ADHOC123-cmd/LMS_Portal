const { Certificate, User, Course } = require('../models/associations');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

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

// Generate certificate
exports.generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const { quizScore } = req.body;
    
        
    if (quizScore < 70) {
      return res.status(400).json({
        success: false,
        message: 'You need at least 70% score to get certificate'
      });
    }
    
    // Check if certificate already exists
    const existing = await Certificate.findOne({ where: { userId, courseId } });
    if (existing) {
      return res.json({
        success: true,
        message: 'Certificate already exists',
        data: existing
      });
    }
    
    const certificate = await Certificate.create({
      userId,
      courseId,
      certificateNumber: generateCertificateNumber(),
      verificationCode: generateVerificationCode(),
      quizScore,
      issueDate: new Date(),
      isVerified: true
    });
    
    res.json({
      success: true,
      message: 'Certificate generated successfully',
      data: {
        id: certificate.id,
        certificateNumber: certificate.certificateNumber,
        verificationCode: certificate.verificationCode,
        downloadUrl: `/api/certificates/${certificate.id}/download`,
        verifyUrl: `/api/certificates/verify/${certificate.verificationCode}`
      }
    });
  } catch (error) {
        res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's certificates
exports.getMyCertificates = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const certificates = await Certificate.findAll({
      where: { userId },
      include: [{ model: Course, as: 'course', attributes: ['id', 'title', 'thumbnail'] }],
      order: [['issueDate', 'DESC']]
    });
    
    res.json({ success: true, data: certificates });
  } catch (error) {
        res.status(500).json({ success: false, message: error.message });
  }
};

// Download certificate PDF
exports.downloadCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    
    const certificate = await Certificate.findByPk(certificateId, {
      include: [
        { model: User, as: 'user' },
        { model: Course, as: 'course' }
      ]
    });
    
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }
    
    // Create PDF
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 0
    });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate_${certificate.certificateNumber}.pdf`);
    
    doc.pipe(res);
    
    const width = doc.page.width;
    const height = doc.page.height;

    // Add Background Image
    const bgPath = path.join(__dirname, '../assets/certificate-background.png');
    if (fs.existsSync(bgPath)) {
      doc.image(bgPath, 0, 0, { width: width, height: height });
    }
    
    // Add Logo Image (Left-aligned, increased size to 90x90)
    const logoPath = path.join(__dirname, '../assets/logo.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 100, 50, { width: 90, height: 90 });
    }
    
    // Add header text centered on the page
    doc.fontSize(46)
       .font('Helvetica-Bold')
       .fillColor('#0d3a78')
       .text('CERTIFICATE', 0, 55, { align: 'center', width: width });
    
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .fillColor('#0d3a78')
       .text('OF COMPLETION', 0, 105, { characterSpacing: 4, align: 'center', width: width });
    
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
    doc.moveTo(width / 2 - 225, 295)
       .lineTo(width / 2 + 225, 295)
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
    doc.moveTo(width / 2 - 80, sigLineY)
       .lineTo(width / 2 + 80, sigLineY)
       .strokeColor('#0d3a78')
       .lineWidth(1)
       .stroke();
       
    const sigPath = path.join(__dirname, '../assets/signature.png');
    if (fs.existsSync(sigPath)) {
      // Centered above the line
      doc.image(sigPath, width / 2 - 60, sigLineY - 45, { width: 120 });
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
    
    doc.end();
  } catch (error) {
        res.status(500).json({ success: false, message: error.message });
  }
};

// Verify certificate (public)
exports.verifyCertificate = async (req, res) => {
  try {
    const { verificationCode } = req.params;
    
    const certificate = await Certificate.findOne({
      where: { verificationCode },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] },
        { model: Course, as: 'course', attributes: ['id', 'title'] }
      ]
    });
    
    if (!certificate) {
      return res.json({ valid: false, message: 'Certificate not found' });
    }
    
    res.json({
      valid: true,
      data: {
        studentName: certificate.user.name,
        courseTitle: certificate.course.title,
        issueDate: certificate.issueDate,
        certificateNumber: certificate.certificateNumber,
        score: certificate.quizScore
      }
    });
  } catch (error) {
        res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all certificates
exports.getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Course, as: 'course', attributes: ['id', 'title'] }
      ],
      order: [['issueDate', 'DESC']]
    });
    
    res.json({ success: true, data: certificates });
  } catch (error) {
        res.status(500).json({ success: false, message: error.message });
  }
};
