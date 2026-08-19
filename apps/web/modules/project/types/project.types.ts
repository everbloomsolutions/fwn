/**
 * Project types
 */

export type ServiceType = 
  | 'cctv' 
  | 'access-control' 
  | 'fire-safety' 
  | 'networking' 
  | 'home-automation'
  | 'other';

export type ProjectStatus = 
  | 'pending'      // Customer submitted, waiting for admin review
  | 'quoted'       // Admin sent quote, waiting for customer
  | 'accepted'     // Customer accepted quote
  | 'rejected'     // Customer rejected quote
  | 'in-progress'  // Work started
  | 'completed'    // Work completed
  | 'cancelled';   // Project cancelled

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface ProjectLocation {
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ProjectMilestone {
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: Date;
}

export interface ProjectAttachment {
  url: string;
  name: string;
  type: string;
  uploadedAt: Date;
}

export interface ProjectNote {
  message: string;
  addedBy: string;
  addedAt: Date;
  isInternal?: boolean;
}

export interface Project {
  _id: string;
  userId: string;
  serviceType: ServiceType;
  title: string;
  description: string;
  location?: ProjectLocation;
  quoteAmount?: number;
  quoteDetails?: string;
  estimatedTimeline?: string;
  quotedAt?: Date;
  quotedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  status: ProjectStatus;
  priority: Priority;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  progress?: number; // 0-100
  milestones?: ProjectMilestone[];
  attachments?: ProjectAttachment[];
  notes?: ProjectNote[];
  startedAt?: Date;
  completedAt?: Date;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectData {
  serviceType: ServiceType;
  title: string;
  description: string;
  location?: {
    address: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  priority?: Priority;
}

export interface ProjectResponse {
  success: boolean;
  data: Project;
  message?: string;
}

export interface ProjectsResponse {
  success: boolean;
  data: Project[];
}

export interface ProjectStats {
  total: number;
  pending: number;
  quoted: number;
  accepted: number;
  inProgress: number;
  completed: number;
}

