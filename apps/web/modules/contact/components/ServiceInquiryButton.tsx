'use client';

import { Button } from '@/shared/ui';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { PUBLIC_ROUTES } from '@/shared/config/routes';
import { generateServiceInquirySubject } from '../utils/subjectMapper';

interface ServiceInquiryButtonProps {
  serviceTitle: string;
  variant?: 'primary' | 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Service Inquiry Button Component
 * Only visible when user is authenticated
 * Links to contact page with service-specific subject
 */
export function ServiceInquiryButton({
  serviceTitle,
  variant = 'primary',
  size = 'sm',
  className,
}: ServiceInquiryButtonProps) {
  const subject = generateServiceInquirySubject(serviceTitle, 'quotation');
  const contactUrl = `${PUBLIC_ROUTES.CONTACT}?subject=${encodeURIComponent(subject)}&service=${encodeURIComponent(serviceTitle)}`;

  return (
    <Link href={contactUrl}>
      <Button variant={variant} size={size} className={className || "w-full"}>
        <MessageCircle className="mr-2 h-4 w-4" />
        Inquiry
      </Button>
    </Link>
  );
}

