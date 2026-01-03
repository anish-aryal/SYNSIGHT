import React from 'react';

export default function SkeletonLoader() {
  return (
    <div className="skeleton-wrapper">
      <div className="skeleton-line" style={{ width: '80%' }} />
      <div className="skeleton-line" style={{ width: '100%' }} />
      <div className="skeleton-line" style={{ width: '60%' }} />
    </div>
  );
}