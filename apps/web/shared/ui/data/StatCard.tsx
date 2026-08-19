'use client';

import { ReactNode, HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/utils/cn';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/cards/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | ReactNode;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  description?: string;
  className?: string;
}

const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, icon, trend, description, className, ...props }, ref) => {
    return (
      <Card ref={ref} className={cn('', className)} {...props}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-text-muted">
              {title}
            </CardTitle>
            {icon && (
              <div className="text-text-light">
                {icon}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-text">
              {value}
            </div>
            {trend && (
              <div className={cn(
                'flex items-center gap-1 text-sm',
                trend.isPositive ? 'text-status-success' : 'text-status-error'
              )}>
                {trend.isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>
                  {Math.abs(trend.value)}% {trend.label || (trend.isPositive ? 'increase' : 'decrease')}
                </span>
              </div>
            )}
            {description && (
              <p className="text-sm text-text-muted">
                {description}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

StatCard.displayName = 'StatCard';

export { StatCard };

