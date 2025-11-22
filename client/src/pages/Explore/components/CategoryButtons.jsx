import React from 'react';
import { Button } from 'reactstrap';

export default function CategoryButtons({ categories, activeCategory, setActiveCategory }) {
  return (
    <div className="d-flex flex-wrap gap-2 mb-4">
      {categories.map((category, index) => (
        <Button
          key={index}
          className={`px-3 py-2 rounded-2 bg-white border border-secondary-subtle ${
            activeCategory === category.toLowerCase()
              ? 'gradient-primary text-white border-0'
              : 'text-dark'
          }`}
          onClick={() => setActiveCategory(category.toLowerCase())}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}