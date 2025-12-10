/**
 * Welcome Email Template
 * Sent when a new user registers
 */

const welcomeEmailTemplate = (user) => {
  const { fullName, email, role } = user;
  const firstName = fullName.split(' ')[0];
  
  const isPatient = role === 'PATIENT';
  const isDentist = role === 'DENTAL_STAFF';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to DentOps</title>
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
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
      color: #667eea;
      font-size: 24px;
      margin: 0 0 20px;
    }
    .content p {
      font-size: 16px;
      line-height: 1.6;
      color: #555;
      margin: 0 0 15px;
    }
    .features {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    .features h3 {
      margin: 0 0 15px;
      color: #333;
      font-size: 18px;
    }
    .features ul {
      margin: 0;
      padding-left: 20px;
    }
    .features li {
      margin: 8px 0;
      color: #555;
      font-size: 15px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      transition: transform 0.2s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
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
    .emoji {
      font-size: 48px;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="emoji">🦷</div>
      <h1>Welcome to DentOps!</h1>
      <p>Your dental practice management made simple</p>
    </div>
    
    <div class="content">
      <h2>Hi ${firstName}! 👋</h2>
      
      <p>
        We're thrilled to have you join DentOps! Your account has been successfully created and you're all set to get started.
      </p>
      
      ${isPatient ? `
      <div class="features">
        <h3>What you can do with DentOps:</h3>
        <ul>
          <li>📅 Book and manage your dental appointments</li>
          <li>📋 View your dental records and treatment history</li>
          <li>🔔 Receive appointment reminders</li>
          <li>💬 Communicate with your dental care team</li>
        </ul>
      </div>
      
      <p>
        Ready to book your first appointment? Log in to your account and browse available times that work for you.
      </p>
      ` : ''}
      
      ${isDentist ? `
      <div class="features">
        <h3>Your DentOps Dashboard Features:</h3>
        <ul>
          <li>📅 Manage your schedule and appointments</li>
          <li>👥 Access patient records and histories</li>
          <li>📊 Track clinic operations and inventory</li>
          <li>⏰ Set your availability preferences</li>
        </ul>
      </div>
      
      <p>
        Your dashboard is ready! Log in to start managing appointments and connecting with patients.
      </p>
      ` : ''}
      
      <center>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="cta-button">
          Go to Dashboard
        </a>
      </center>
      
      <p style="margin-top: 30px;">
        If you have any questions or need assistance, our support team is here to help.
      </p>
    </div>
    
    <div class="footer">
      <p><strong>DentOps</strong></p>
      <p>Making dental practice management effortless</p>
      <p style="margin-top: 15px; font-size: 12px;">
        This email was sent to ${email}
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
};

module.exports = welcomeEmailTemplate;
