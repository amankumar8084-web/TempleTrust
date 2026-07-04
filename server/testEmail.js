import { sendEmail } from './services/emailService.js';

(async () => {
  try {
    const result = await sendEmail({
      to: 'test@example.com', // replace with a real address you control or keep mock
      subject: 'Test Email from BrahamBaba',
      html: '<h1>Hello from BrahamBaba Test</h1><p>This is a test email.</p>'
    });
    console.log('Email result:', result);
  } catch (err) {
    console.error('Error sending email:', err);
  }
})();
