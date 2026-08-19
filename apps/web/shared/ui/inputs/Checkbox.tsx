'use client';

import { InputHTMLAttributes, forwardRef, useId } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
  indeterminate?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, indeterminate, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;
    const errorId = `${checkboxId}-error`;
    const descriptionId = description ? `${checkboxId}-description` : undefined;

    return (
      <div className="w-full">
        <div className="flex items-start space-x-3">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              id={checkboxId}
              ref={ref}
              className="peer sr-only"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? errorId : descriptionId}
              data-indeterminate={indeterminate}
              {...props}
            />
            <label
              htmlFor={checkboxId}
              className={cn(
                'flex h-5 w-5 cursor-pointer items-center justify-center rounded border-2 border-border bg-surface transition-all',
                'peer-checked:bg-primary peer-checked:border-primary',
                'peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2',
                'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
                error && 'border-status-error peer-focus-visible:ring-status-error',
                className
              )}
            >
              {indeterminate ? (
                <div className="h-0.5 w-3 bg-text-inverse" />
              ) : (
                <Check className="h-3 w-3 text-text-inverse opacity-0 transition-opacity peer-checked:opacity-100" />
              )}
            </label>
          </div>
          {(label || description) && (
            <div className="flex-1">
              {label && (
                <label
                  htmlFor={checkboxId}
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

Checkbox.displayName = 'Checkbox';

export { Checkbox };

