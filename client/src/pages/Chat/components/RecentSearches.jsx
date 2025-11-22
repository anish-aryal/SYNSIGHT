import React from 'react';
import { Badge } from 'reactstrap';
import { Clock } from 'lucide-react';

export default function RecentSearches({ searches, onSearchClick }) {
  return (
    <div className="topics-card">
      <div className="topics-header">
        <Clock size={18} color='#6155F5' className="topics-icon" />
        <h2 className="topics-title fs-6">Recent Searches</h2>
      </div>
      <div className="topics-list">
        {searches.map((search, index) => (
          <Badge 
            key={index} 
            color="white" 
            className="topic-badge px-3 py-2 rounded-2 "
            onClick={() => onSearchClick(search)}
            role="button"
            tabIndex={0}
          >
            <span className='fs-6'>{search}</span> 
          </Badge>
        ))}
      </div>
    </div>
  );
}