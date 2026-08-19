/**
 * Subject mapper utility
 * Maps service titles to inquiry subjects for contact form
 */

/**
 * Generate inquiry subject for a service
 * @param serviceTitle - The title of the service
 * @param inquiryType - Type of inquiry (default: 'quotation')
 * @returns Formatted subject string
 */
export function generateServiceInquirySubject(
  serviceTitle: string,
  inquiryType: 'quotation' | 'location' | 'availability' | 'support' | 'other' = 'quotation'
): string {
  const typeMap: Record<string, string> = {
    quotation: 'Quotation for',
    location: 'Location Inquiry for',
    availability: 'Service Availability for',
    support: 'Technical Support for',
    other: 'Inquiry about',
  };

  const prefix = typeMap[inquiryType] || typeMap.quotation;
  return `${prefix} ${serviceTitle}`;
}

/**
 * Generate a general inquiry subject based on inquiry type
 * @param inquiryType - Type of inquiry
 * @returns Subject string
 */
export function generateGeneralInquirySubject(
  inquiryType: 'quotation' | 'location' | 'availability' | 'support' | 'other'
): string {
  const subjectMap: Record<string, string> = {
    quotation: 'Ask for Quotation',
    location: 'Location Inquiry',
    availability: 'Service Availability',
    support: 'Technical Support',
    other: 'Other Inquiries',
  };

  return subjectMap[inquiryType] || subjectMap.other;
}

