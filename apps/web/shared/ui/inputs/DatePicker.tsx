'use client';

import { InputHTMLAttributes, forwardRef, useId } from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  label?: string;
  error?: string;
  description?: string;
  value?: string;
  onChange?: (value: string) => void;
  format?: 'date' | 'datetime-local';
  min?: string;
  max?: string;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, label, error, description, id, value, onChange, format = 'date', min, max, required, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const descriptionId = description ? `${inputId}-description` : undefined;


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1 block text-sm font-medium text-text"
          >
            {label}
            {required && (
              <span className="ml-1 text-status-error" aria-label="required">
                *
              </span>
            )}
          </label>
        )}
        {description && (
          <p id={descriptionId} className="mb-1 text-sm text-text-muted">
            {description}
          </p>
        )}
        <div className="relative">
          <input
            type={format}
            id={inputId}
            ref={ref}
            value={value}
            onChange={handleChange}
            min={min}
            max={max}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? errorId : descriptionId}
            aria-required={required}
            className={cn(
              'flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 pl-10 text-sm text-text ring-offset-surface',
              'placeholder:text-text-muted',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-status-error focus-visible:ring-status-error',
              className
            )}
            {...props}
          />
          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted pointer-events-none" />
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

DatePicker.displayName = 'DatePicker';

export { DatePicker };

