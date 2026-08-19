'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { getUserProjects } from '../services/projectService';
import type { Project, ProjectStatus, ServiceType } from '../types/project.types';
import { logger } from '@/shared/utils/logger';

export function useProjects(filters?: {
  status?: ProjectStatus;
  serviceType?: ServiceType;
}) {
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      setProjects([]);
      return;
    }

    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getUserProjects(filters);
        setProjects(data);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch projects');
        setError(error);
        logger.error('Failed to fetch projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [isAuthenticated, filters?.status, filters?.serviceType]);

  const refetch = async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await getUserProjects(filters);
      setProjects(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch projects');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    projects,
    isLoading,
    error,
    refetch,
  };
}

