import { Project, IProject, ServiceType, ProjectStatus } from './project.model';
import mongoose from 'mongoose';

export interface CreateProjectData {
  userId: string;
  serviceType: ServiceType;
  title: string;
  description: string;
  location?: {
    address: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}


/**
 * Create a new project/service request
 */
export const createProject = async (data: CreateProjectData): Promise<IProject> => {
  const project = new Project({
    ...data,
    userId: new mongoose.Types.ObjectId(data.userId),
    status: 'pending',
  });
  
  return await project.save();
};

/**
 * Get user's projects
 */
export const getUserProjects = async (
  userId: string,
  filters?: {
    status?: ProjectStatus;
    serviceType?: ServiceType;
  }
): Promise<IProject[]> => {
  const query: Record<string, unknown> = { userId: new mongoose.Types.ObjectId(userId) };
  
  if (filters?.status) {
    query.status = filters.status;
  }
  
  if (filters?.serviceType) {
    query.serviceType = filters.serviceType;
  }
  
  return await Project.find(query)
    .sort({ createdAt: -1 })
    .populate('assignedTo', 'name email')
    .exec();
};

/**
 * Get project by ID (with user check)
 */
export const getProjectById = async (
  projectId: string,
  userId: string
): Promise<IProject | null> => {
  return await Project.findOne({
    _id: new mongoose.Types.ObjectId(projectId),
    userId: new mongoose.Types.ObjectId(userId),
  })
    .populate('assignedTo', 'name email')
    .populate('quotedBy', 'name email')
    .exec();
};

/**
 * Accept quote (Customer)
 */
export const acceptQuote = async (
  projectId: string,
  userId: string
): Promise<IProject> => {
  const project = await Project.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(projectId),
      userId: new mongoose.Types.ObjectId(userId),
      status: 'quoted',
    },
    {
      status: 'accepted',
    },
    { new: true }
  );
  
  if (!project) {
    throw new Error('Project not found or quote already processed');
  }
  
  return project;
};

/**
 * Reject quote (Customer)
 */
export const rejectQuote = async (
  projectId: string,
  userId: string
): Promise<IProject> => {
  const project = await Project.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(projectId),
      userId: new mongoose.Types.ObjectId(userId),
      status: 'quoted',
    },
    {
      status: 'rejected',
    },
    { new: true }
  );
  
  if (!project) {
    throw new Error('Project not found or quote already processed');
  }
  
  return project;
};
