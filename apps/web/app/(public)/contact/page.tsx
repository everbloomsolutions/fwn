'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container, Card, CardContent, CardHeader, CardTitle, ContactFormSection, Heading, Text, BackToTop, OfficeLocationMap } from '@/shared/ui';
import { Mail, Phone, MapPin, Clock, MessageSquare } from 'lucide-react';
import { submitContactForm } from '@/modules/contact/services/contactService';
import type { ContactFormData } from '@/shared/ui/sections/ContactFormSection';
import { useToast } from '@/shared/ui';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { logger } from '@/shared/utils/logger';
import { motion } from 'framer-motion';
import { brandConfig } from '@/shared/brand';

// Office location coordinates (Madeenaguda, Hyderabad)
const OFFICE_COORDINATES: [number, number] = [78.373, 17.495]; // [longitude, latitude]
const OFFICE_ADDRESS = '202, Grecious Homes, Lane Number 1, Mythri Nagar, Madeenaguda, Hyderabad 500049';

export default function ContactPage() {
  const searchParams = useSearchParams();
  const { success, error: showError } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Extract query parameters
  const subjectParam = searchParams.get('subject');
  const serviceParam = searchParams.get('service');

  // Generate initial message with service context if service is provided
  const initialMessage = useMemo(() => {
    if (serviceParam) {
      return `I am interested in ${serviceParam}. Please provide more information.`;
    }
    return '';
  }, [serviceParam]);

  const handleSubmit = async (data: ContactFormData) => {
    try {
      // Ensure subject meets schema requirements (min 3 chars)
      const subject = data.subject && data.subject.trim().length >= 3 
        ? data.subject.trim() 
        : 'General Inquiry';
      
      // Prepare payload
      const payload = {
        name: data.name.trim(),
        email: data.email.trim(),
        subject: subject,
        message: data.message.trim(),
      };
      
      logger.debug('Submitting contact form with payload:', payload);
      
      const response = await submitContactForm(payload);

      if (response.success) {
        success(
          'Message sent successfully!',
          response.message || 'We will get back to you soon.'
        );
      } else {
        throw new Error(response.message || 'Failed to send message');
      }
    } catch (err: unknown) {
      logger.error('Contact form submission error:', err);
      
      // Extract error message from axios error response
      let errorMessage = 'Please try again later.';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { 
          response?: { 
            data?: { 
              message?: string; 
              errors?: Array<{ field: string; message: string }> 
            };
            status?: number;
          } 
        };
        
        logger.debug('Error response data:', axiosError.response?.data);
        logger.debug('Error status:', axiosError.response?.status);
        
        if (axiosError.response?.data?.errors && axiosError.response.data.errors.length > 0) {
          // Show validation errors
          const validationErrors = axiosError.response.data.errors
            .map((e) => `${e.field}: ${e.message}`)
            .join(', ');
          errorMessage = `Validation failed: ${validationErrors}`;
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      showError('Failed to send message', errorMessage);
      // Error is already handled via toast notification
      // Form component will handle its own error state if needed
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10">
        <Container maxWidth="xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Heading level="h1" className="mb-4">
              Contact Us
            </Heading>
            <Text className="mx-auto max-w-3xl text-lg text-text-muted">
              Have a question or want to learn more about our services? We&apos;d love to hear from you. 
              Get in touch with {brandConfig.name} today.
            </Text>
          </motion.div>
        </Container>
      </section>

      {/* Main Content */}
      <section className="py-8 sm:py-12 lg:py-16">
        <Container maxWidth="xl">
          <div className="grid gap-8 lg:grid-cols-3">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card enableHover className="h-full hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-2xl">Contact Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="flex items-start group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-semibold text-text mb-2">Email</p>
                    <div className="space-y-1">
                      <a
                        href="mailto:info@foodworldnaturals.com"
                        className="block text-sm text-primary hover:text-primary-hover hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded px-1 -ml-1"
                        aria-label="Send email to info@foodworldnaturals.com"
                      >
                        info@foodworldnaturals.com
                      </a>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="flex items-start group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-status-success/10 text-status-success group-hover:bg-status-success/20 transition-colors">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-semibold text-text mb-2">Phone</p>
                    <a
                      href="tel:+919876543210"
                      className="block text-sm text-primary hover:text-primary-hover hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded px-1 -ml-1"
                      aria-label="Call +91 98765 43210"
                    >
                      +91 98765 43210
                    </a>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="flex items-start group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-semibold text-text mb-2">Address</p>
                    <p className="text-sm text-text-muted leading-relaxed">
                      202, Grecious Homes, Lane Number 1
                      <br />
                      Mythri Nagar, Madeenaguda
                      <br />
                      Hyderabad 500049
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="flex items-start group pt-4 border-t border-border"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-semibold text-text mb-2">Business Hours</p>
                    <div className="text-sm text-text-muted space-y-1">
                      <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p>Saturday: 9:00 AM - 2:00 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
            </motion.div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ContactFormSection
                title="Send us a message"
                description="Fill out the form below and we'll get back to you as soon as possible."
                onSubmit={handleSubmit}
                initialEmail={isAuthenticated && user?.email ? user.email : undefined}
                initialName={isAuthenticated && user?.name ? user.name : undefined}
                initialSubject={subjectParam || undefined}
                initialMessage={initialMessage}
              />
            </motion.div>
          </div>
        </div>
        </Container>
      </section>

      {/* Office Location Map Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-surface via-bg-muted to-surface">
        <Container maxWidth="xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <Heading level="h2" className="mb-4">
              Find Us
            </Heading>
            <Text className="mx-auto max-w-2xl text-lg text-text-muted">
              Visit our office in Hyderabad. We&apos;re located in Madeenaguda, easily accessible and ready to serve you.
            </Text>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full"
          >
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="h-[400px] md:h-[500px] lg:h-[600px] w-full">
                  <OfficeLocationMap
                    coordinates={OFFICE_COORDINATES}
                    address={OFFICE_ADDRESS}
                    zoom={16}
                    className="h-full w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </section>

      <BackToTop />
    </div>
  );
}
