'use client';

import { InputHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from '@/shared/utils/cn';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, error, id, ...props }, ref) => {
    const generatedId = useId();
    const switchId = id || generatedId;
    const errorId = `${switchId}-error`;
    const descriptionId = description ? `${switchId}-description` : undefined;

    return (
      <div className="w-full">
        <div className="flex items-start space-x-3">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              id={switchId}
              ref={ref}
              role="switch"
              className="peer sr-only"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? errorId : descriptionId}
              {...props}
            />
            <label
              htmlFor={switchId}
              className={cn(
                'relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full border-2 border-border bg-surface transition-colors',
                'peer-checked:bg-primary peer-checked:border-primary',
                'peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2',
                'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
                error && 'border-status-error peer-focus-visible:ring-status-error',
                className
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  'translate-x-1 peer-checked:translate-x-6'
                )}
              />
            </label>
          </div>
          {(label || description) && (
            <div className="flex-1">
              {label && (
                <label
                  htmlFor={switchId}
                  className="text-sm font-medium text-text cursor-pointer"
                >
                  {label}
                  {props.required && (
                    <span className="ml-1 text-status-error" aria-label="required">
                      *
                    </span>
                  )}
                </label>
              )}
              {description && (
                <p id={descriptionId} className="mt-1 text-sm text-text-muted">
                  {description}
                </p>
              )}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-1 text-sm text-status-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';

export { Switch };

