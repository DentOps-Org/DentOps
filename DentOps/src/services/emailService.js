const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const welcomeEmailTemplate = require('../templates/email/welcomeEmail');
const appointmentConfirmationTemplate = require('../templates/email/appointmentConfirmation');

/**
 * Email Service - Supports both Nodemailer (local) and Resend (production)
 * Automatically uses Resend if RESEND_API_KEY is set, otherwise falls back to Gmail/SMTP
 */

// Initialize Resend client (only if API key exists)
let resendClient = null;
if (process.env.RESEND_API_KEY) {
  resendClient = new Resend(process.env.RESEND_API_KEY);
}

// Nodemailer transporter (fallback for local development)
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000
    });
  }
  return transporter;
};

/**
 * Base function to send emails
 * Uses Resend if API key is available, otherwise uses Nodemailer
 */
const sendEmail = async (options) => {
  try {
    // Option 1: Use Resend (recommended for production)
    if (resendClient) {
      console.log('📧 Sending email via Resend...');
      
      const result = await resendClient.emails.send({
        from: process.env.EMAIL_FROM || 'DentOps <onboarding@resend.dev>',
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      console.log('✅ Email sent successfully via Resend:', {
        id: result.data?.id,
        to: options.to,
        subject: options.subject,
      });

      return { success: true, messageId: result.data?.id };
    }

    // Option 2: Use Nodemailer (fallback for local development)
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('⚠️  Email service not configured. Skipping email send.');
      return { success: false, message: 'Email service not configured' };
    }

    console.log('📧 Sending email via Nodemailer (SMTP)...');
    const transport = getTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || `DentOps <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || '',
    };

    const info = await transport.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully via Nodemailer:', {
      messageId: info.messageId,
      to: options.to,
      subject: options.subject,
    });

    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    
    // Provide helpful error messages
    if (error.message?.includes('timeout')) {
      console.error('💡 Tip: Connection timeout - if on Render, use RESEND_API_KEY instead of SMTP');
    }
    
    return { success: false, error: error.message };
  }
};

/**
 * Send welcome email to new users
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
