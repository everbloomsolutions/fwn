/**
 * Contact Form Component
 * Contact form section with form fields
 */

'use client';

import { HTMLAttributes, FormEvent, useState, useEffect } from 'react';
import { Container, Section, SectionHeader, Card, CardContent, Button, Input, Textarea, Select } from '@/shared/ui';
import { MotionDiv } from '@/shared/ui/components/motion/MotionDiv';
import { cn } from '@/shared/utils/cn';
import { logger } from '@/shared/utils/logger';

export interface ContactFormProps extends Omit<HTMLAttributes<HTMLElement>, 'onSubmit'> {
  title?: string;
  description?: string;
  onSubmit?: (data: ContactFormData) => void | Promise<void>;
  initialEmail?: string;
  initialName?: string;
  initialSubject?: string;
  initialMessage?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

const SUBJECT_OPTIONS = [
  { value: '', label: 'Select inquiry type...' },
  { value: 'Ask for Quotation', label: 'Ask for Quotation' },
  { value: 'Location Inquiry', label: 'Location Inquiry' },
  { value: 'Service Availability', label: 'Service Availability' },
  { value: 'Technical Support', label: 'Technical Support' },
  { value: 'Other Inquiries', label: 'Other Inquiries' },
  { value: 'custom', label: 'Custom Subject' },
];

export function ContactForm({
  title = 'Get in Touch',
  description,
  onSubmit,
  initialEmail = '',
  initialName = '',
  initialSubject = '',
  initialMessage = '',
  className,
  ...props
}: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: initialName,
    email: initialEmail,
    subject: initialSubject || '',
    message: initialMessage || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSubjectType, setSelectedSubjectType] = useState<string>(
    initialSubject && !SUBJECT_OPTIONS.some(opt => opt.value === initialSubject) ? 'custom' : initialSubject || ''
  );
  const [customSubject, setCustomSubject] = useState<string>(
    initialSubject && !SUBJECT_OPTIONS.some(opt => opt.value === initialSubject) ? initialSubject : ''
  );
  
  // Update form data when initial values change (e.g., user logs in)
  // Only update if the field is currently empty to avoid overwriting user input
  useEffect(() => {
    setFormData((prev) => {
      const updates: Partial<ContactFormData> = {};
      if (initialEmail && !prev.email) {
        updates.email = initialEmail;
      }
      if (initialName && !prev.name) {
        updates.name = initialName;
      }
      if (initialSubject && !prev.subject) {
        updates.subject = initialSubject;
        // Check if it's a custom subject
        if (!SUBJECT_OPTIONS.some(opt => opt.value === initialSubject)) {
          setSelectedSubjectType('custom');
          setCustomSubject(initialSubject);
        } else {
          setSelectedSubjectType(initialSubject);
        }
      }
      if (initialMessage && !prev.message) {
        updates.message = initialMessage;
      }
      return Object.keys(updates).length > 0 ? { ...prev, ...updates } : prev;
    });
  }, [initialEmail, initialName, initialSubject, initialMessage]);

  // Update subject when selection changes
  useEffect(() => {
    if (selectedSubjectType === 'custom') {
      setFormData((prev) => ({ ...prev, subject: customSubject }));
    } else {
      setFormData((prev) => ({ ...prev, subject: selectedSubjectType }));
    }
  }, [selectedSubjectType, customSubject]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit?.(formData);
      // Reset form but preserve initial email/name if available (for authenticated users)
      setFormData({ 
        name: initialName || '', 
        email: initialEmail || '', 
        subject: '', 
        message: '' 
      });
      setSelectedSubjectType('');
      setCustomSubject('');
    } catch (error) {
      logger.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section className={cn('bg-surface', className)} {...props}>
      <Container maxWidth="xl">
        <SectionHeader title={title || 'Get in Touch'} description={description} />
        <MotionDiv variant="slideUp">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">
                    Subject
                    <span className="ml-1 text-xs text-text-muted">(optional)</span>
                  </label>
                  <Select
                    id="subject"
                    value={selectedSubjectType}
                    onChange={(e) => setSelectedSubjectType(e.target.value)}
                    options={SUBJECT_OPTIONS}
                    className="mb-2"
                  />
                  {selectedSubjectType === 'custom' && (
                    <Input
                      id="custom-subject"
                      type="text"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder="Enter custom subject"
                      className="mt-2"
                    />
                  )}
                  <p className="mt-1 text-xs text-text-muted">
                    Select the type of inquiry to help us respond faster
                  </p>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Your message"
                    rows={6}
                  />
                </div>
                <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </MotionDiv>
      </Container>
    </Section>
  );
}

