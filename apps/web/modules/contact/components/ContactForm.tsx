'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Textarea, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';
import { contactSchema, type ContactFormData } from '../schemas/contactSchema';
import { submitContactForm } from '@/modules/contact/services/contactService';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

export function ContactForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setError(null);
    try {
      const payload = {
        ...data,
        subject: data.subject?.trim() || undefined,
      };
      await submitContactForm(payload);
      setIsSuccess(true);
      reset();
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send us a message</CardTitle>
      </CardHeader>
      <CardContent>
        {isSuccess && (
          <div className="mb-4 rounded-lg bg-status-success/10 border border-status-success/20 p-4 flex items-center space-x-2 text-status-success">
            <CheckCircle className="h-5 w-5" />
            <p className="text-sm">Thank you! Your message has been sent successfully.</p>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-status-error/10 border border-status-error/20 p-4 flex items-center space-x-2 text-status-error">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Name"
            required
            disabled={isSubmitting}
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email"
            type="email"
            required
            disabled={isSubmitting}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Subject"
            disabled={isSubmitting}
            error={errors.subject?.message}
            {...register('subject')}
          />

          <Textarea
            label="Message"
            required
            disabled={isSubmitting}
            rows={6}
            error={errors.message?.message}
            {...register('message')}
          />

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              'Sending...'
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
