import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email
export const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"ShopHub" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Email could not be sent');
  }
};

// Email templates
export const emailTemplates = {
  welcome: (name) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Welcome to ShopHub!</h2>
      <p>Hi ${name},</p>
      <p>Thank you for joining ShopHub. We're excited to have you as part of our community!</p>
      <p>Start exploring our amazing products and enjoy shopping with us.</p>
      <p>Best regards,<br>The ShopHub Team</p>
    </div>
  `,

  orderConfirmation: (name, orderNumber, total) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Order Confirmation</h2>
      <p>Hi ${name},</p>
      <p>Thank you for your order! We've received your order and it's being processed.</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Total Amount:</strong> $${total}</p>
      </div>
      <p>We'll send you another email when your order ships.</p>
      <p>Best regards,<br>The ShopHub Team</p>
    </div>
  `,

  passwordReset: (name, resetUrl) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Password Reset Request</h2>
      <p>Hi ${name},</p>
      <p>You requested a password reset for your ShopHub account.</p>
      <p>Click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
      </div>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 10 minutes.</p>
      <p>Best regards,<br>The ShopHub Team</p>
    </div>
  `
};