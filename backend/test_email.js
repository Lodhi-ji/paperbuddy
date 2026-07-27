import dotenv from 'dotenv';
dotenv.config();

import { sendStudentWelcomeEmail } from './src/utils/email.js';

async function testEmail() {
  console.log('Testing email service with Resend...');
  const result = await sendStudentWelcomeEmail('ritiklodhi35@gmail.com', 'Test Student', '111111');
  if (result.success) {
    console.log('Successfully sent test email!', result.data);
  } else {
    console.error('Failed to send test email:', result.error);
  }
}

testEmail();
