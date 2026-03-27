import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (user) => {
  const html = `
    <h1>Welcome to Golf Charity Platform!</h1>
    <p>Hi ${user.firstName},</p>
    <p>Thank you for joining our platform. You can now:</p>
    <ul>
      <li>Enter your golf scores</li>
      <li>Participate in monthly draws</li>
      <li>Support your chosen charity</li>
    </ul>
    <p>Good luck!</p>
  `;

  await sendEmail(user.email, 'Welcome to Golf Charity Platform', html);
};

export const sendDrawResultsEmail = async (user, draw, winnings) => {
  const html = `
    <h1>Draw Results - ${draw.month}/${draw.year}</h1>
    <p>Hi ${user.firstName},</p>
    <p>The monthly draw results are in!</p>
    <p><strong>Winning Numbers:</strong> ${draw.drawNumbers.join(', ')}</p>
    ${winnings.length > 0 ? `
      <h2>Congratulations! You won!</h2>
      ${winnings.map(w => `
        <p>${w.matchType}: $${w.prizeAmount}</p>
      `).join('')}
      <p>Please upload proof of your scores to claim your prize.</p>
    ` : `
      <p>Better luck next month!</p>
    `}
  `;

  await sendEmail(user.email, 'Monthly Draw Results', html);
};