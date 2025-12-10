/**
 * Appointment Confirmation Email Template
 * Sent to both patient and dentist when appointment is confirmed
 */

const appointmentConfirmationTemplate = ({ recipient, appointment, patient, dentist, appointmentType }) => {
  const isPatient = recipient === 'patient';
  
  // Format date and time
  const startTime = new Date(appointment.startTime);
  const endTime = new Date(appointment.endTime);
  
  const dateString = startTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const timeString = startTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  
  const endTimeString = endTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const recipientName = isPatient ? patient.fullName.split(' ')[0] : dentist.fullName.split(' ')[0];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Confirmation</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f7fa;
      color: #333;
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .header p {
      margin: 10px 0 0;
      font-size: 16px;
      opacity: 0.95;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #10b981;
      font-size: 22px;
      margin: 0 0 20px;
    }
    .content p {
      font-size: 16px;
      line-height: 1.6;
      color: #555;
      margin: 0 0 15px;
    }
    .appointment-card {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border-left: 4px solid #10b981;
      border-radius: 8px;
      padding: 25px;
      margin: 25px 0;
    }
    .appointment-detail {
      display: flex;
      align-items: center;
      margin: 15px 0;
      font-size: 15px;
    }
    .appointment-detail strong {
      min-width: 140px;
      color: #059669;
      font-weight: 600;
    }
    .appointment-detail span {
      color: #333;
    }
    .info-box {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    .info-box h3 {
      margin: 0 0 12px;
      color: #333;
      font-size: 16px;
      font-weight: 600;
    }
    .info-box p {
      margin: 8px 0;
      font-size: 15px;
    }
    .cta-buttons {
      margin: 30px 0;
      text-align: center;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 15px;
      margin: 5px;
      transition: transform 0.2s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
    }
    .cta-button-secondary {
      background: #6c757d;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e9ecef;
    }
    .footer p {
      margin: 5px 0;
      font-size: 14px;
      color: #6c757d;
    }
    .checkmark {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .note {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      border-radius: 4px;
      padding: 15px;
      margin: 20px 0;
      font-size: 14px;
      color: #856404;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="checkmark">✅</div>
      <h1>${isPatient ? 'Appointment Confirmed' : 'New Appointment Assigned'}</h1>
      <p>${dateString}</p>
    </div>
    
    <div class="content">
      <h2>Hi ${recipientName}! 👋</h2>
      
      <p>
        ${isPatient 
          ? 'Your dental appointment has been confirmed. Here are the details:'
          : 'You have been assigned a new appointment. Here are the details:'
        }
      </p>
      
      <div class="appointment-card">
        <div class="appointment-detail">
          <strong>📅 Date:</strong>
          <span>${dateString}</span>
        </div>
        <div class="appointment-detail">
          <strong>🕐 Time:</strong>
          <span>${timeString} - ${endTimeString}</span>
        </div>
        <div class="appointment-detail">
          <strong>⏱️ Duration:</strong>
          <span>${appointmentType.durationMinutes} minutes</span>
        </div>
        <div class="appointment-detail">
          <strong>🦷 Type:</strong>
          <span>${appointmentType.name}</span>
        </div>
        ${isPatient ? `
        <div class="appointment-detail">
          <strong>👨‍⚕️ Dentist:</strong>
          <span>Dr. ${dentist.fullName}</span>
        </div>
        ` : `
        <div class="appointment-detail">
          <strong>👤 Patient:</strong>
          <span>${patient.fullName}</span>
        </div>
        <div class="appointment-detail">
          <strong>📧 Email:</strong>
          <span>${patient.email}</span>
        </div>
        ${patient.phone ? `
        <div class="appointment-detail">
          <strong>📱 Phone:</strong>
          <span>${patient.phone}</span>
        </div>
        ` : ''}
        `}
      </div>
      
      ${appointment.notes ? `
      <div class="info-box">
        <h3>📝 Notes:</h3>
        <p>${appointment.notes}</p>
      </div>
      ` : ''}
      
      ${isPatient ? `
      <div class="note">
        <strong>⚠️ Important:</strong> Please arrive 10 minutes early to complete any necessary paperwork.
        If you need to reschedule or cancel, please do so at least 24 hours in advance.
      </div>
      
      <div class="cta-buttons">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/appointments" class="cta-button">
          View Appointment
        </a>
      </div>
      ` : `
      <div class="cta-buttons">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/appointments" class="cta-button">
          View in Dashboard
        </a>
      </div>
      `}
      
      <p style="margin-top: 30px; font-size: 14px; color: #6c757d;">
        ${isPatient 
          ? 'We look forward to seeing you! If you have any questions, please contact us.'
          : 'Patient details and records are available in your dashboard.'
        }
      </p>
    </div>
    
    <div class="footer">
      <p><strong>DentOps</strong></p>
      <p>Your dental practice management system</p>
      <p style="margin-top: 15px; font-size: 12px;">
        Appointment ID: ${appointment._id}
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
};

module.exports = appointmentConfirmationTemplate;
