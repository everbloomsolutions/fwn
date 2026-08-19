/**
 * Theme Toggle Component
 * Reusable component for switching between light and dark themes
 */

'use client';

import { Sun, Moon } from 'lucide-react';
import { Button } from '@/shared/ui';
import { useColorMode } from '@/shared/core/theme/hooks/useColorMode';
import { cn } from '@/shared/utils/cn';
import { Tooltip } from '@/shared/ui';

export interface ThemeToggleProps {
  variant?: 'icon' | 'button' | 'switch';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({
  variant = 'icon',
  size = 'md',
  showLabel = false,
  className,
}: ThemeToggleProps) {
  const { resolvedMode, toggleColorMode, mounted } = useColorMode();

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={cn('h-9 w-9', className)} aria-hidden="true" />
    );
  }

  const isDark = resolvedMode === 'dark';
  const Icon = isDark ? Sun : Moon;

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-10 w-10',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  if (variant === 'icon') {
    const button = (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleColorMode}
        className={cn(
          sizeClasses[size],
          'p-0',
          className
        )}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-pressed={isDark}
      >
        <Icon className={cn(iconSizes[size], 'transition-transform')} />
      </Button>
    );

    return (
      <Tooltip content={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
        {button}
      </Tooltip>
    );
  }

  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={toggleColorMode}
        className={cn('gap-2', className)}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-pressed={isDark}
      >
        <Icon className={iconSizes[size]} />
        {showLabel && (
          <span>{isDark ? 'Light' : 'Dark'}</span>
        )}
      </Button>
    );
  }

  // Switch variant (for settings page)
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={toggleColorMode}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          isDark ? 'bg-primary' : 'bg-border'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            isDark ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
      {showLabel && (
        <span className="text-sm text-text-muted">
          {isDark ? 'Dark mode' : 'Light mode'}
        </span>
      )}
    </div>
  );
}

