/**
 * Contact controller - HTTP handlers for contact routes
 */

import { Request, Response, NextFunction } from 'express';
import * as contactService from './contact.service';

/**
 * Submit contact form
 * POST /api/v1/contact
 */
export const submitContact = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, subject, message } = req.body;

    // Ensure subject is set - handle undefined, empty string, or short strings
    const finalSubject = (subject && typeof subject === 'string' && subject.trim().length >= 3) 
      ? subject.trim() 
      : 'General Inquiry';

    // Get client IP and user agent for tracking
    const ipAddress = req.ip || req.socket.remoteAddress || undefined;
    const userAgent = req.get('user-agent') || undefined;

    await contactService.processContactForm({
      name: name.trim(),
      email: email.trim(),
      subject: finalSubject,
      message: message.trim(),
      ipAddress,
      userAgent,
    });

    res.status(200).json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.',
    });
  } catch (error) {
    next(error);
  }
};

export const contactController = {
  submitContact,
};

