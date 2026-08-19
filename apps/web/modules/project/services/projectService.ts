/**
 * Project service for API calls
 */

import { apiRequest } from '@/shared/core/http/apiClient';
import { transformError } from '@/shared/core/error/errorHandler';
import { API_ENDPOINTS } from '@/shared/config/api';
import { 
  Project, 
  CreateProjectData, 
  ProjectResponse, 
  ProjectsResponse,
  ProjectStatus,
  ServiceType 
} from '../types/project.types';

/**
 * Create a new project/service request
 */
export async function createProject(data: CreateProjectData): Promise<Project> {
  try {
    const response = await apiRequest<ProjectResponse>({
      method: 'POST',
      url: API_ENDPOINTS.projects.CREATE,
      data,
    });

    return response.data;
  } catch (error) {
    throw transformError(error);
  }
}

/**
 * Get user's projects
 */
export async function getUserProjects(filters?: {
  status?: ProjectStatus;
  serviceType?: ServiceType;
}): Promise<Project[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.serviceType) params.append('serviceType', filters.serviceType);

    const response = await apiRequest<ProjectsResponse>({
      method: 'GET',
      url: `${API_ENDPOINTS.projects.LIST}?${params.toString()}`,
    });

    return response.data;
  } catch (error) {
    throw transformError(error);
  }
}

/**
 * Get project by ID
 */
export async function getProjectById(id: string): Promise<Project> {
  try {
    const response = await apiRequest<ProjectResponse>({
      method: 'GET',
      url: API_ENDPOINTS.projects.DETAIL(id),
    });

    return response.data;
  } catch (error) {
    throw transformError(error);
  }
}

/**
 * Accept quote
 */
export async function acceptQuote(id: string): Promise<Project> {
  try {
    const response = await apiRequest<ProjectResponse>({
      method: 'POST',
      url: API_ENDPOINTS.projects.ACCEPT_QUOTE(id),
    });

    return response.data;
  } catch (error) {
    throw transformError(error);
  }
}

/**
 * Reject quote
 */
export async function rejectQuote(id: string): Promise<Project> {
  try {
    const response = await apiRequest<ProjectResponse>({
      method: 'POST',
      url: API_ENDPOINTS.projects.REJECT_QUOTE(id),
    });

    return response.data;
  } catch (error) {
    throw transformError(error);
  }
}

