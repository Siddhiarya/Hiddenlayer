const nodemailer = require('nodemailer');

/**
 * Get configured nodemailer transporter
 */
const getTransporter = async () => {
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  // Check if live credentials are configured
  if (host && user && pass && user !== 'your_email@domain.com') {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  // Fallback for dev/test: return mock/ethereal or console transporter
  return {
    sendMail: async (options) => {
      console.log('---------------- EMAIL NOTIFICATION ----------------');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Text/Preview: ${options.text || '(HTML message)'}`);
      console.log('----------------------------------------------------');
      return { messageId: 'dev-mock-msg-id', response: 'Logged to console' };
    },
  };
};

/**
 * Send email verification link
 * @param {string} toEmail
 * @param {string} token
 * @param {string} employeeId
 */
const sendVerificationEmail = async (toEmail, token, employeeId) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const verificationUrl = `${clientUrl}/verify-email?token=${token}`;

  const subject = 'Dayflow HRMS - Verify Your Email Address';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #4f46e5;">Welcome to Dayflow HRMS</h2>
      <p>Hello <strong>${employeeId}</strong>,</p>
      <p>Thank you for registering on Dayflow. Please verify your email address to activate your account and log in.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email Address</a>
      </div>
      <p>Or use this verification token directly: <code>${token}</code></p>
      <p>This verification link will expire in 24 hours.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888;">If you did not create an account on Dayflow HRMS, please ignore this email.</p>
    </div>
  `;

  const text = `Hello ${employeeId},\n\nPlease verify your Dayflow HRMS account using the following link:\n${verificationUrl}\n\nOr verification token: ${token}\n\nThis token will expire in 24 hours.`;

  try {
    const transporter = await getTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Dayflow HRMS" <no-reply@dayflow.com>',
      to: toEmail,
      subject,
      text,
      html,
    };
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error(`[EmailService] Failed to send verification email to ${toEmail}:`, error.message);
    // Don't throw fatal error during registration if mail server has issues
    return null;
  }
};

/**
 * Send password reset email
 * @param {string} toEmail
 * @param {string} token
 */
const sendPasswordResetEmail = async (toEmail, token) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const resetUrl = `${clientUrl}/reset-password?token=${token}`;

  const subject = 'Dayflow HRMS - Password Reset Request';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #ef4444;">Password Reset Request</h2>
      <p>You recently requested to reset your password for your Dayflow HRMS account.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
      </div>
      <p>Or use this reset token: <code>${token}</code></p>
      <p>This link is valid for 1 hour. If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888;">Dayflow HRMS Security Team</p>
    </div>
  `;

  const text = `You requested a password reset for Dayflow HRMS.\n\nReset link: ${resetUrl}\nReset token: ${token}\n\nThis token will expire in 1 hour.`;

  try {
    const transporter = await getTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Dayflow HRMS" <no-reply@dayflow.com>',
      to: toEmail,
      subject,
      text,
      html,
    };
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error(`[EmailService] Failed to send password reset email to ${toEmail}:`, error.message);
    return null;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
