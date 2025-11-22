import React from 'react';
import { Badge } from 'reactstrap';
import { TrendingUp } from 'lucide-react';

export default function TrendingTopics({ topics, onTopicClick }) {
  return (
    <div className="topics-card">
      <div className="topics-header">
        <TrendingUp size={18} className="topics-icon" />
        <h3 className="topics-title fs-6">Trending Now</h3>
      </div>
      <div className="topics-list">
        {topics.map((topic, index) => (
          <Badge 
            key={index} 
            color="white" 
            className="topic-badge py-2 px-3 rounded-2"
            onClick={() => onTopicClick(topic)}
          >
           <span className='fs-6' >{topic}</span> 
          </Badge>
        ))}
      </div>
    </div>
  );
}