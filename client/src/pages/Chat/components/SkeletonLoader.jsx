import React from 'react';

// Skeleton Loader UI block for Chat page.

export default function SkeletonLoader() {
  // Layout and appearance
  return (
    <div className="skeleton-wrapper">
      <div className="skeleton-line" style={{ width: '80%' }} />
      <div className="skeleton-line" style={{ width: '100%' }} />
      <div className="skeleton-line" style={{ width: '60%' }} />
    </div>
  );
}