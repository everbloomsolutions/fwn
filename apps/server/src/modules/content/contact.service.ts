/**
 * Contact service - Business logic for contact form
 */

import { logger } from '../../core/middleware/logger';
import { Contact, IContact } from './contact.model';
import { emailService } from '../../core/utils/emailService';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Process contact form submission
 */
export const processContactForm = async (data: ContactFormData): Promise<IContact> => {
  try {
    // Save to database
    const contact = await Contact.create({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      status: 'new',
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });

    logger.info('Contact form submission saved to database', {
      contactId: contact._id,
      email: data.email,
    });

    // Send email notifications (non-blocking, but logged)
    // Don't await to avoid blocking the response, but handle errors properly
    Promise.all([
      emailService.sendContactNotificationToAdmin({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      }),
      emailService.sendContactConfirmationToUser({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      }),
    ])
      .then(() => {
        logger.info('Contact form emails sent successfully', {
          contactId: contact._id,
          email: data.email,
        });
      })
      .catch((error) => {
        // Log email errors with full details but don't fail the request
        logger.error('Failed to send contact form emails', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          contactId: contact._id,
          email: data.email,
        });
      });

    return contact;
  } catch (error) {
    logger.error('Error processing contact form', error);
    throw error;
  }
};

export const contactService = {
  processContactForm,
};

