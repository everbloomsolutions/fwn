'use client';

import { InputHTMLAttributes, forwardRef, useId, Children, isValidElement, cloneElement } from 'react';
import { cn } from '@/shared/utils/cn';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, error, id, ...props }, ref) => {
    const generatedId = useId();
    const radioId = id || generatedId;
    const errorId = `${radioId}-error`;
    const descriptionId = description ? `${radioId}-description` : undefined;

    return (
      <div className="w-full">
        <div className="flex items-start space-x-3">
          <div className="relative flex items-center">
            <input
              type="radio"
              id={radioId}
              ref={ref}
              className="peer sr-only"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? errorId : descriptionId}
              {...props}
            />
            <label
              htmlFor={radioId}
              className={cn(
                'flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border-2 border-border bg-surface transition-all',
                'peer-checked:border-primary',
                'peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2',
                'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
                error && 'border-status-error peer-focus-visible:ring-status-error',
                className
              )}
            >
              <div className="h-2.5 w-2.5 rounded-full bg-primary opacity-0 transition-opacity peer-checked:opacity-100" />
            </label>
          </div>
          {(label || description) && (
            <div className="flex-1">
              {label && (
                <label
                  htmlFor={radioId}
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

Radio.displayName = 'Radio';

export { Radio };

// Radio Group component
export interface RadioGroupProps {
  name: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  error?: string;
}

export function RadioGroup({
  name,
  value,
  onValueChange,
  children,
  className,
  error,
}: RadioGroupProps) {
  return (
    <div className={cn('space-y-2', className)} role="radiogroup" aria-invalid={error ? 'true' : 'false'}>
      {Children.map(children, (child: React.ReactNode) => {
        if (isValidElement(child)) {
          const childValue = (child.props as any).value;
          if (childValue !== undefined) {
            return cloneElement(child as React.ReactElement<RadioProps>, {
              name,
              checked: value === childValue,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                if (e.target.checked && childValue) {
                  onValueChange?.(childValue);
                }
                (child.props as any).onChange?.(e);
              },
            });
          }
        }
        return child;
      })}
      {error && (
        <p className="text-sm text-status-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

