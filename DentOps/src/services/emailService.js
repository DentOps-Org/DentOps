const nodemailer = require('nodemailer');
const welcomeEmailTemplate = require('../templates/email/welcomeEmail');
const appointmentConfirmationTemplate = require('../templates/email/appointmentConfirmation');

/**
 * Email Service using Nodemailer
 * Handles all email notifications for DentOps
 */

// Create reusable transporter
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      connectionTimeout: 5000, // 5 seconds
      greetingTimeout: 5000,
      socketTimeout: 5000
    });
  }
  return transporter;
};

/**
 * Base function to send emails
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 */
const sendEmail = async (options) => {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('⚠️  Email service not configured. Skipping email send.');
      return { success: false, message: 'Email service not configured' };
    }

    const transport = getTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || `DentOps <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || '',
    };

    const info = await transport.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', {
      messageId: info.messageId,
      to: options.to,
      subject: options.subject,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send welcome email to new users
 * @param {Object} user - User object
 * @param {string} user.email - User email
 * @param {string} user.fullName - User full name
 * @param {string} user.role - User role (PATIENT, DENTAL_STAFF)
 */
const sendWelcomeEmail = async (user) => {
  try {
    const html = welcomeEmailTemplate(user);
    
    const subject = `Welcome to DentOps, ${user.fullName.split(' ')[0]}! 🦷`;
    
    const result = await sendEmail({
      to: user.email,
      subject,
      html,
      text: `Welcome to DentOps! We're excited to have you on board.`,
    });

    return result;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send appointment confirmation email to patient
 * @param {Object} appointment - Appointment object
 * @param {Object} patient - Patient user object
 * @param {Object} dentist - Dentist user object
 * @param {Object} appointmentType - Appointment type object
 */
const sendAppointmentConfirmationToPatient = async (appointment, patient, dentist, appointmentType) => {
  try {
    const html = appointmentConfirmationTemplate({
      recipient: 'patient',
      appointment,
      patient,
      dentist,
      appointmentType,
    });

    const appointmentDate = new Date(appointment.startTime).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const subject = `Appointment Confirmed - ${appointmentDate} 🦷`;

    const result = await sendEmail({
      to: patient.email,
      subject,
      html,
      text: `Your dental appointment has been confirmed for ${appointmentDate}.`,
    });

    return result;
  } catch (error) {
    console.error('Failed to send patient confirmation email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send appointment confirmation email to dentist
 * @param {Object} appointment - Appointment object
 * @param {Object} patient - Patient user object
 * @param {Object} dentist - Dentist user object
 * @param {Object} appointmentType - Appointment type object
 */
const sendAppointmentConfirmationToDentist = async (appointment, patient, dentist, appointmentType) => {
  try {
    const html = appointmentConfirmationTemplate({
      recipient: 'dentist',
      appointment,
      patient,
      dentist,
      appointmentType,
    });

    const appointmentDate = new Date(appointment.startTime).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const subject = `New Appointment Assigned - ${appointmentDate}`;

    const result = await sendEmail({
      to: dentist.email,
      subject,
      html,
      text: `You have been assigned a new appointment for ${appointmentDate}.`,
    });

    return result;
  } catch (error) {
    console.error('Failed to send dentist confirmation email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendAppointmentConfirmationToPatient,
  sendAppointmentConfirmationToDentist,
};
