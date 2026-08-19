/**
 * Contact service for API calls
 */

import { apiRequest } from '@/shared/core/http/apiClient';
import { API_ENDPOINTS } from '@/shared/config/api';
import { ContactFormData } from '../schemas/contactSchema';

export interface ContactResponse {
  success: boolean;
  message: string;
}

/**
 * Submit contact form
 */
export async function submitContactForm(data: ContactFormData): Promise<ContactResponse> {
  return apiRequest<ContactResponse>({
    method: 'POST',
    url: API_ENDPOINTS.contact,
    data,
  });
}

