/**
 * Email service - Handles email notifications
 * Supports SMTP via Nodemailer
 */

import nodemailer from 'nodemailer';
import { logger } from '../middleware/logger';
import { escapeHtml } from './sanitize';
import { brandConfig } from '../config/brand';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface ContactNotificationData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Create email transporter
 * Returns null if SMTP is not configured (will log instead)
 */
const createTransporter = () => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  // If SMTP is not configured, return null (will log instead)
  if (!smtpHost || !smtpUser || !smtpPass) {
    logger.info('SMTP not configured - emails will be logged instead of sent');
    return null;
  }

  try {
    // Trim all SMTP values to remove any whitespace
    const cleanHost = smtpHost.trim();
    const cleanUser = smtpUser.trim();
    // Remove all whitespace including newlines, tabs, and spaces from password
    // Gmail App Passwords should be exactly 16 characters with no spaces
    const cleanPassword = smtpPass.trim().replace(/\s+/g, '');
    
    // Log password length for debugging (but not the actual password)
    if (cleanHost.includes('gmail.com')) {
      if (cleanPassword.length !== 16) {
        logger.warn('⚠️  Gmail App Password length mismatch:', {
          expectedLength: 16,
          actualLength: cleanPassword.length,
          smtpUser: cleanUser,
          suggestion: 'Gmail App Passwords must be exactly 16 characters. Check your SMTP_PASS environment variable.',
          helpUrl: 'https://myaccount.google.com/apppasswords',
        });
      }
      
      // Check if password might be the regular Gmail password (common mistake)
      if (cleanPassword.length > 20) {
        logger.warn('⚠️  Password length suggests you might be using regular Gmail password instead of App Password:', {
          passwordLength: cleanPassword.length,
          suggestion: 'Generate an App Password from: https://myaccount.google.com/apppasswords',
        });
      }
    }
    
    return nodemailer.createTransport({
      host: cleanHost,
      port: parseInt(smtpPort || '587'),
      secure: smtpPort === '465', // true for 465, false for other ports
      auth: {
        user: cleanUser,
        pass: cleanPassword,
      },
      // Add TLS options for better compatibility
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production',
      },
    });
  } catch (error) {
    logger.error('Failed to create email transporter:', error);
    return null;
  }
};

/**
 * Verify email configuration on startup
 * This helps catch configuration issues early
 */
export const verifyEmailConfig = async (): Promise<void> => {
  const transporter = createTransporter();
  
  if (!transporter) {
    logger.info('📧 Email service: Not configured (emails will be logged)');
    return;
  }

  const smtpHost = process.env.SMTP_HOST?.trim() || '';
  const isGmail = smtpHost.includes('gmail.com');

  try {
    // Verify connection (only for Gmail to catch auth issues early)
    if (isGmail) {
      logger.info('📧 Verifying Gmail SMTP configuration...');
      await transporter.verify();
      logger.info('✅ Email service: Gmail SMTP configuration verified successfully');
    } else {
      logger.info(`📧 Email service: Configured for ${smtpHost}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('BadCredentials') || errorMessage.includes('Username and Password not accepted')) {
      logger.error('❌ Email service: Gmail authentication failed on startup', {
        issue: 'Invalid credentials',
        smtpUser: process.env.SMTP_USER,
        smtpHost: process.env.SMTP_HOST,
        passwordLength: process.env.SMTP_PASS?.trim().replace(/\s+/g, '').length,
        suggestions: [
          '1. Go to: https://myaccount.google.com/apppasswords',
          '2. Generate a new App Password for "Mail"',
          '3. Copy the 16-character password (remove all spaces)',
          '4. Update SMTP_PASS in your .env file',
          '5. Restart the server',
          '',
          'Common mistakes:',
          '- Using regular Gmail password instead of App Password',
          '- App Password has spaces (should be exactly 16 chars, no spaces)',
          '- SMTP_USER doesn\'t match the account where App Password was generated',
          '- Quotes around password in .env file',
        ],
        error: errorMessage.substring(0, 200), // Truncate long error messages
      });
    } else {
      logger.warn('⚠️  Email service: Configuration verification failed (will attempt to send anyway)', {
        error: errorMessage.substring(0, 200),
      });
    }
  }
};

/**
 * Send email
 * Uses Nodemailer if SMTP is configured, otherwise logs the email
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const transporter = createTransporter();
  const fromEmail = (process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@example.com').trim();

  // If SMTP is not configured, log the email details
  if (!transporter) {
    logger.info('Email would be sent (SMTP not configured)', {
      to: options.to,
      subject: options.subject,
      from: fromEmail,
    });
    logger.debug('Email content:', {
      html: options.html.substring(0, 200) + '...',
      text: options.text?.substring(0, 200) + '...',
    });
    
    // In development, you might want to see the reset URL in logs
    if (options.subject.includes('Password Reset') || options.subject.includes('Reset Your')) {
      // Match both single and double quotes in href attributes
      const urlMatch = options.html.match(/href=['"]([^'"]+)['"]/);
      if (urlMatch) {
        logger.info('Password reset URL (for testing):', urlMatch[1]);
      }
    }
    
    return;
  }

  try {
    const mailOptions = {
      from: `'${brandConfig.name}' <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, '').replace(/\n\s*\n/g, '\n'),
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully', {
      to: options.to,
      subject: options.subject,
      messageId: info.messageId,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Provide helpful error messages for common Gmail authentication issues
    if (errorMessage.includes('BadCredentials') || errorMessage.includes('Username and Password not accepted')) {
      logger.error('Gmail authentication failed. Common causes:', {
        issue: 'Invalid credentials',
        suggestions: [
          '1. Verify 2-Step Verification is enabled on your Gmail account',
          '2. Generate a new App Password from: https://myaccount.google.com/apppasswords',
          '3. Ensure the App Password is 16 characters with NO spaces',
          '4. Make sure you\'re using an App Password, not your regular Gmail password',
          '5. Check that the SMTP_USER matches the Gmail account where the App Password was generated',
          '6. Copy the App Password exactly - it should be 16 characters without spaces',
          '7. Remove any quotes or extra characters from SMTP_PASS in your .env file',
        ],
        smtpUser: process.env.SMTP_USER,
        error: errorMessage,
      });
    } else {
      logger.error('Failed to send email:', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
    
    throw error;
  }
};

/**
 * Send contact form notification to admin
 */
export const sendContactNotificationToAdmin = async (
  data: ContactNotificationData
): Promise<void> => {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').trim();
  
  // Warn if ADMIN_EMAIL is not configured
  if (!process.env.ADMIN_EMAIL || adminEmail === 'admin@example.com') {
    logger.warn('ADMIN_EMAIL not configured. Using default admin@example.com. Set ADMIN_EMAIL in your .env file to receive inquiry notifications.');
  }
  
  logger.info('Sending contact form notification to admin', {
    adminEmail,
    fromEmail: data.email,
    subject: data.subject,
  });
  
  // Sanitize user input to prevent email injection
  const safeName = escapeHtml(data.name);
  const safeEmail = escapeHtml(data.email);
  const safeSubject = escapeHtml(data.subject);
  const safeMessage = escapeHtml(data.message).replace(/\n/g, '<br>');

  const subject = `New Contact Form Submission: ${safeSubject}`;
  const html = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: ${brandConfig.colors.primary}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">${brandConfig.name}</h1>
      </div>
      <div style="background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
        <h2 style="color: ${brandConfig.colors.primary}; margin-top: 0;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <p><strong>Message:</strong></p>
        <p style="background-color: white; padding: 15px; border-radius: 4px; border-left: 3px solid ${brandConfig.colors.primary};">
          ${safeMessage}
        </p>
      </div>
      <div style="background-color: #f9fafb; padding: 15px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280;">
        <p style="margin: 0;">This is an automated notification from ${brandConfig.name}</p>
        <p style="margin: 5px 0 0 0;">${brandConfig.contact.email}</p>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      to: adminEmail,
      subject,
      html,
    });
    logger.info('Contact form notification sent successfully to admin', {
      adminEmail,
    });
  } catch (error) {
    logger.error('Failed to send contact form notification to admin', {
      adminEmail,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
};

/**
 * Send confirmation email to user
 */
export const sendContactConfirmationToUser = async (
  data: ContactNotificationData
): Promise<void> => {
  logger.info('Sending contact form confirmation to user', {
    userEmail: data.email,
    subject: data.subject,
  });
  
  // Sanitize user input to prevent email injection
  const safeName = escapeHtml(data.name);
  const safeSubject = escapeHtml(data.subject);
  const safeMessage = escapeHtml(data.message).replace(/\n/g, '<br>');

  const subject = `Thank you for contacting ${brandConfig.name} - ${safeSubject}`;
  const html = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: ${brandConfig.colors.primary}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">${brandConfig.name}</h1>
      </div>
      <div style="background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
        <h2 style="color: ${brandConfig.colors.primary}; margin-top: 0;">Thank you for contacting us!</h2>
        <p>Hi ${safeName},</p>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <div style="background-color: white; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 3px solid ${brandConfig.colors.primary};">
          <p style="margin: 0 0 10px 0; font-weight: 600; color: ${brandConfig.colors.primary};"><strong>Your message:</strong></p>
          <p style="margin: 0;">${safeMessage}</p>
        </div>
      </div>
      <div style="background-color: #f9fafb; padding: 15px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="margin: 0; color: #374151;">Best regards,<br><strong>The ${brandConfig.name} Team</strong></p>
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">
          ${brandConfig.contact.email} | ${brandConfig.contact.website}
        </p>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      to: data.email,
      subject,
      html,
    });
    logger.info('Contact form confirmation sent successfully to user', {
      userEmail: data.email,
    });
  } catch (error) {
    logger.error('Failed to send contact form confirmation to user', {
      userEmail: data.email,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
};

/**
 * Send password reset email to user
 */
export const sendPasswordResetEmail = async (
  user: { email: string; name?: string },
  resetUrl: string
): Promise<void> => {
  const safeName = escapeHtml(user.name || 'there');

  const subject = `Reset Your ${brandConfig.name} Password`;
  const html = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: ${brandConfig.colors.primary}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">${brandConfig.name}</h1>
      </div>
      <div style="background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
        <h2 style="color: ${brandConfig.colors.primary}; margin-top: 0;">Password Reset Request</h2>
        <p>Hi ${safeName},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: ${brandConfig.colors.primary}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 14px; color: #6b7280;">
          Or copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: ${brandConfig.colors.primary}; word-break: break-all;">${resetUrl}</a>
        </p>
        <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
          <strong>This link will expire in 1 hour.</strong><br>
          If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
      <div style="background-color: #f9fafb; padding: 15px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280;">
        <p style="margin: 0;">This is an automated email from ${brandConfig.name}</p>
        <p style="margin: 5px 0 0 0;">${brandConfig.contact.email}</p>
      </div>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject,
    html,
  });
};

/**
 * Send password reset confirmation email
 */
export const sendPasswordResetConfirmationEmail = async (
  user: { email: string; name?: string }
): Promise<void> => {
  const safeName = escapeHtml(user.name || 'there');

  const subject = `Password Reset Successful - ${brandConfig.name}`;
  const html = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: ${brandConfig.colors.primary}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">${brandConfig.name}</h1>
      </div>
      <div style="background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
        <h2 style="color: ${brandConfig.colors.primary}; margin-top: 0;">Password Reset Successful</h2>
        <p>Hi ${safeName},</p>
        <p>Your password has been successfully reset. If you didn't make this change, please contact us immediately.</p>
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #92400e;">
            <strong>Security Tip:</strong> If you didn't request this password reset, please contact our support team immediately.
          </p>
        </div>
      </div>
      <div style="background-color: #f9fafb; padding: 15px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280;">
        <p style="margin: 0;">This is an automated email from ${brandConfig.name}</p>
      </div>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject,
    html,
  });
};

export const emailService = {
  sendEmail,
  sendContactNotificationToAdmin,
  sendContactConfirmationToUser,
  sendPasswordResetEmail,
  sendPasswordResetConfirmationEmail,
  verifyEmailConfig,
};
