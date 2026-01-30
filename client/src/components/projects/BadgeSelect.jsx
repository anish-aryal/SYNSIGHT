import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

// Badge Select component for projects UI.

export const CATEGORY_OPTIONS = [
  'General',
  'Marketing',
  'Product',
  'Research',
  'Operations',
  'Customer Success',
  'Sales',
  'Support',
  'Finance',
  'HR',
  'Engineering',
  'Other'
];

export const STATUS_OPTIONS = ['Active', 'Draft', 'Paused', 'Completed', 'Archived'];

export const toBadgeSlug = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const getCategoryBadgeClass = (value) => `category-${toBadgeSlug(value)}`;
export const getStatusBadgeClass = (value) => `status-${toBadgeSlug(value)}`;

export default function BadgeSelect({
  id,
  value,
  options,
  onChange,
  placeholder = 'Select option',
  getBadgeClass,
  hasError
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    // Layout and appearance
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const badgeClass = value ? getBadgeClass?.(value) : '';

  return (
    <div className={`project-form-select ${isOpen ? 'is-open' : ''}`} ref={wrapperRef}>
      <button
        type="button"
        className={`project-form-select-trigger ${hasError ? 'is-error' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={id}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="project-form-select-value">
          {value ? (
            <span className={`project-form-badge ${badgeClass}`.trim()}>{value}</span>
          ) : (
            <span className="project-form-select-placeholder">{placeholder}</span>
          )}
        </span>
        <ChevronDown size={16} />
      </button>
      {isOpen ? (
        <div className="project-form-select-menu" role="listbox" id={id}>
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className={`project-form-select-option ${option === value ? 'is-selected' : ''}`}
              role="option"
              aria-selected={option === value}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              <span className={`project-form-badge ${getBadgeClass?.(option)}`.trim()}>{option}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
