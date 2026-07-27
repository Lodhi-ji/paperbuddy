import nodemailer from 'nodemailer';

// Create a reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 465,
  secure: true, // true for 465, false for other ports like 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends a welcome email to a new student with their login credentials.
 * @param {string} toEmail - The student's email address
 * @param {string} studentName - The student's full name
 * @param {string} password - The auto-generated password
 */
export async function sendStudentWelcomeEmail(toEmail, studentName, password) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Campus Pay Admin" <admin@campuspay.com>', // sender address
      to: toEmail, // list of receivers
      subject: 'Welcome to Campus Pay - Your Login Credentials', // Subject line
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #1e293b;">Welcome to Campus Pay, ${studentName}!</h2>
          <p style="color: #475569; font-size: 16px;">Your student account has been successfully created. You can now log in to the portal to view your academic records, fees, and more.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #334155;"><strong>Login URL:</strong> <a href="http://localhost:5173/login">http://localhost:5173/login</a></p>
            <p style="margin: 10px 0 0 0; color: #334155;"><strong>Email:</strong> ${toEmail}</p>
            <p style="margin: 10px 0 0 0; color: #334155;"><strong>Password:</strong> ${password}</p>
          </div>
          
          <p style="color: #475569; font-size: 14px;"><em>Please change your password after logging in for the first time.</em></p>
        </div>
      `,
    });
    
    console.log('Email sent successfully via Nodemailer. Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email via Nodemailer:', error);
    return { success: false, error };
  }
}

/**
 * Sends a password reset email to a user.
 * @param {string} toEmail - The user's email address
 * @param {string} resetUrl - The secure link to reset the password
 */
export async function sendPasswordResetEmail(toEmail, resetUrl) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Campus Pay Admin" <admin@campuspay.com>',
      to: toEmail,
      subject: 'Reset Your Password - Campus Pay',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #1e293b;">Password Reset Request</h2>
          <p style="color: #475569; font-size: 16px;">We received a request to reset your password for your Campus Pay account.</p>
          <p style="color: #475569; font-size: 16px;">Click the button below to set a new password. This link will expire in 15 minutes.</p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${resetUrl}" style="background-color: #5B5CEB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          
          <p style="color: #475569; font-size: 14px;"><em>If you did not request this password reset, please ignore this email or contact support if you have concerns.</em></p>
        </div>
      `,
    });
    
    console.log('Password reset email sent successfully via Nodemailer. Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email via Nodemailer:', error);
    return { success: false, error };
  }
}
