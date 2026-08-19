'use client';

import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/shared/ui';
import { Project, ProjectStatus } from '../types/project.types';
import { Clock, CheckCircle, XCircle, AlertCircle, Wrench, FileCheck } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/shared/utils/cn';

function formatTimeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

interface ProjectCardProps {
  project: Project;
}

const statusConfig: Record<ProjectStatus, { label: string; variant: 'default' | 'success' | 'error' | 'warning' | 'info'; icon: React.ReactNode }> = {
  pending: {
    label: 'Pending',
    variant: 'default',
    icon: <Clock className="h-4 w-4" />,
  },
  quoted: {
    label: 'Quoted',
    variant: 'info',
    icon: <AlertCircle className="h-4 w-4" />,
  },
  accepted: {
    label: 'Accepted',
    variant: 'success',
    icon: <CheckCircle className="h-4 w-4" />,
  },
  rejected: {
    label: 'Rejected',
    variant: 'error',
    icon: <XCircle className="h-4 w-4" />,
  },
  'in-progress': {
    label: 'In Progress',
    variant: 'warning',
    icon: <Wrench className="h-4 w-4" />,
  },
  completed: {
    label: 'Completed',
    variant: 'success',
    icon: <FileCheck className="h-4 w-4" />,
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'error',
    icon: <XCircle className="h-4 w-4" />,
  },
};

const serviceTypeLabels: Record<string, string> = {
  'cctv': 'CCTV',
  'access-control': 'Access Control',
  'fire-safety': 'Fire Safety',
  'networking': 'Networking',
  'home-automation': 'Home Automation',
  'other': 'Other',
};

export function ProjectCard({ project }: ProjectCardProps) {
  const statusInfo = statusConfig[project.status];
  const serviceLabel = serviceTypeLabels[project.serviceType] || project.serviceType;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{project.title}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {serviceLabel}
              </Badge>
              <Badge variant={statusInfo.variant} className="text-xs flex items-center gap-1">
                {statusInfo.icon}
                {statusInfo.label}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-text-muted line-clamp-2">{project.description}</p>
          
          {project.location && (
            <div className="text-sm text-text-muted">
              <span className="font-medium">Location: </span>
              {project.location.address}
            </div>
          )}

          {project.quoteAmount && project.status !== 'pending' && (
            <div className="text-sm">
              <span className="font-medium text-text">Quote: </span>
              <span className="text-text">₹{project.quoteAmount.toLocaleString()}</span>
            </div>
          )}

          {project.progress !== undefined && project.status === 'in-progress' && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Progress</span>
                <span className="font-medium">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-text-muted">
              {formatTimeAgo(project.createdAt)}
            </span>
            <Link href={`/projects/${project._id}`}>
              <Button size="sm" variant="outline">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

