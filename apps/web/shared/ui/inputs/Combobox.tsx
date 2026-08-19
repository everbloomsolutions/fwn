'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { Input } from '@/shared/ui';
import { cn } from '@/shared/utils/cn';
import { Popover } from '@/shared/ui/overlays/Popover';

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  label?: string;
  description?: string;
  error?: string;
  placeholder?: string;
  searchable?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  label,
  description,
  error,
  placeholder = 'Select an option...',
  searchable = true,
  multiple = false,
  disabled = false,
  required,
  className,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
  const selectedOptions = options.filter((opt) => selectedValues.includes(opt.value));

  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange?.(newValues);
    } else {
      onChange?.(optionValue);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) {
      onChange?.(selectedValues.filter((v) => v !== optionValue));
    } else {
      onChange?.('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredOptions.length > 0) {
      handleSelect(filteredOptions[0].value);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const displayValue = searchable
    ? searchQuery
    : selectedOptions.map((opt) => opt.label).join(', ') || '';

  return (
    <div className={cn('w-full', className)}>
      <Popover
        trigger={
          <div className="relative">
            <Input
              ref={inputRef}
              label={label}
              description={description}
              error={error}
              placeholder={placeholder}
              value={displayValue}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!isOpen) setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              required={required}
              readOnly={!searchable}
              className="cursor-pointer pr-10"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 pointer-events-none">
              {selectedOptions.length > 0 && !multiple && !searchable && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(selectedValues[0], e);
                  }}
                  className="pointer-events-auto mr-1"
                  aria-label="Clear selection"
                >
                  <X className="h-3 w-3 text-text-muted hover:text-text" />
                </button>
              )}
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-text-muted transition-transform',
                  isOpen && 'rotate-180'
                )}
              />
            </div>
          </div>
        }
        content={
          <div className="w-64 max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-text-muted">No options found</div>
            ) : (
              <div className="py-1">
                {filteredOptions.map((option) => {
                  const isSelected = selectedValues.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => !option.disabled && handleSelect(option.value)}
                      disabled={option.disabled}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors',
                        'hover:bg-surface-hover focus:bg-surface-hover focus:outline-none',
                        isSelected && 'bg-primary-light',
                        option.disabled && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        }
        open={isOpen}
        onOpenChange={setIsOpen}
        position="bottom"
        align="start"
      />

      {multiple && selectedOptions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <span
              key={option.value}
              className="inline-flex items-center space-x-1 rounded-md bg-primary-light px-2 py-1 text-sm text-primary"
            >
              <span>{option.label}</span>
              <button
                type="button"
                onClick={(e) => handleRemove(option.value, e)}
                className="hover:text-primary-hover"
                aria-label={`Remove ${option.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
