import React from 'react';
import { Button } from 'reactstrap';

export default function CategoryButtons({ categories, activeCategory, setActiveCategory }) {
  return (
    <div className="d-flex flex-wrap gap-2 mt-4 mb-4">
      {categories.map((category, index) => (
        <Button
          key={index}
          className={`px-3 py-2 rounded-2 bg-white  ${
            activeCategory === category.toLowerCase()
              ? ' text-primary border border-primary'
              : 'text-dark border-0'
          }`}
          onClick={() => setActiveCategory(category.toLowerCase())}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}