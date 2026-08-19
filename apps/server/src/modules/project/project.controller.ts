import { Request, Response, NextFunction } from 'express';
import * as projectService from './project.service';
import { createProjectSchema } from './project.schema';
import { AppError } from '../../core/exceptions/errorHandler';
import { ProjectStatus, ServiceType } from './project.model';

// Extend Express Request to include user
interface AuthenticatedRequest extends Request {
  user?: Express.User;
}

/**
 * Create a new project/service request
 * POST /api/v1/projects
 */
export const createProject = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const validated = createProjectSchema.parse(req.body);
    
    const project = await projectService.createProject({
      ...validated,
      userId: req.user._id.toString(),
    });
    
    res.status(201).json({
      success: true,
      data: project,
      message: 'Service request submitted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's projects
 * GET /api/v1/projects
 */
export const getUserProjects = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { status, serviceType } = req.query;
    
    const projects = await projectService.getUserProjects(req.user._id.toString(), {
      status: status as ProjectStatus | undefined,
      serviceType: serviceType as ServiceType | undefined,
    });
    
    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get project by ID
 * GET /api/v1/projects/:id
 */
export const getProjectById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const project = await projectService.getProjectById(
      req.params.id,
      req.user._id.toString()
    );
    
    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found',
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Accept quote
 * POST /api/v1/projects/:id/accept-quote
 */
export const acceptQuote = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const project = await projectService.acceptQuote(
      req.params.id,
      req.user._id.toString()
    );
    
    res.status(200).json({
      success: true,
      data: project,
      message: 'Quote accepted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject quote
 * POST /api/v1/projects/:id/reject-quote
 */
export const rejectQuote = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const project = await projectService.rejectQuote(
      req.params.id,
      req.user._id.toString()
    );
    
    res.status(200).json({
      success: true,
      data: project,
      message: 'Quote rejected',
    });
  } catch (error) {
    next(error);
  }
};

