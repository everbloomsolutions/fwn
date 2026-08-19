/**
 * Contact Form Section Component
 * Contact form section with form fields
 */

'use client';

import { HTMLAttributes, FormEvent, useState, useEffect } from 'react';
import { Container, Section, SectionHeader, Card, CardContent, Button, Input, Textarea, Select } from '@/shared/ui';
import { MotionDiv } from '@/shared/ui/components/motion/MotionDiv';
import { cn } from '@/shared/utils/cn';
import { logger } from '@/shared/utils/logger';

export interface ContactFormSectionProps extends Omit<HTMLAttributes<HTMLElement>, 'onSubmit'> {
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

export function ContactFormSection({
  title = 'Get in Touch',
  description,
  onSubmit,
  initialEmail = '',
  initialName = '',
  initialSubject = '',
  initialMessage = '',
  className,
  ...props
}: ContactFormSectionProps) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [subject, setSubject] = useState(initialSubject);
  const [customSubject, setCustomSubject] = useState('');
  const [message, setMessage] = useState(initialMessage);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    setName(initialName);
    setEmail(initialEmail);
    setSubject(initialSubject);
    setMessage(initialMessage);
  }, [initialName, initialEmail, initialSubject, initialMessage]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const finalSubject = subject === 'custom' ? customSubject : subject;
      const formData: ContactFormData = {
        name,
        email,
        subject: finalSubject,
        message,
      };

      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Default submission logic
        logger.info('Contact form submitted', { formData });
      }

      setSubmitStatus('success');
      // Reset form
      setName('');
      setEmail('');
      setSubject('');
      setCustomSubject('');
      setMessage('');
    } catch (error) {
      logger.error('Contact form submission error', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section className={cn('bg-surface', className)} {...props}>
      <Container maxWidth="lg">
        <SectionHeader title={title || 'Get in Touch'} description={description} />
        <MotionDiv variant="fade">
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Input
                    label="Name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Your name"
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>

                <Select
                  label="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  options={SUBJECT_OPTIONS}
                />

                {subject === 'custom' && (
                  <Input
                    label="Custom Subject"
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    required
                    placeholder="Enter your subject"
                  />
                )}

                <Textarea
                  label="Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  placeholder="Your message..."
                  rows={6}
                />

                {submitStatus === 'success' && (
                  <div className="p-4 bg-status-success/10 text-status-success rounded-lg">
                    Thank you! Your message has been sent successfully.
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="p-4 bg-status-error/10 text-status-error rounded-lg">
                    Something went wrong. Please try again.
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </MotionDiv>
      </Container>
    </Section>
  );
}

