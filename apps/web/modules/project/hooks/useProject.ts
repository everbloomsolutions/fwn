'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { getProjectById } from '../services/projectService';
import type { Project } from '../types/project.types';
import { logger } from '@/shared/utils/logger';

export function useProject(id: string | null) {
  const { isAuthenticated } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !id) {
      setIsLoading(false);
      setProject(null);
      return;
    }

    const fetchProject = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getProjectById(id);
        setProject(data);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch project');
        setError(error);
        logger.error('Failed to fetch project:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [isAuthenticated, id]);

  const refetch = async () => {
    if (!isAuthenticated || !id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await getProjectById(id);
      setProject(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch project');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    project,
    isLoading,
    error,
    refetch,
  };
}

