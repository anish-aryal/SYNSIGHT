import React from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TrendingUp, Clock } from 'lucide-react';

export default function FilterTabs({ activeTab, setActiveTab }) {
  return (
    <Nav className="mb-4">
      <NavItem>
        <NavLink
          className={`d-flex align-items-center gap-2 px-3 py-2 rounded-2 border-0 ${
            activeTab === 'trending' 
              ? 'bg-light text-dark fw-medium' 
              : 'text-muted bg-transparent'
          }`}
          style={{ cursor: 'pointer' }}
          onClick={() => setActiveTab('trending')}
        >
          <TrendingUp size={16} />
          <span>Trending</span>
        </NavLink>
      </NavItem>
      <NavItem>
        <NavLink
          className={`d-flex align-items-center gap-2 px-3 py-2 rounded-2 border-0 ${
            activeTab === 'recent' 
              ? 'bg-light text-dark fw-medium' 
              : 'text-muted bg-transparent'
          }`}
          style={{ cursor: 'pointer' }}
          onClick={() => setActiveTab('recent')}
        >
          <Clock size={16} />
          <span>Recent</span>
        </NavLink>
      </NavItem>
    </Nav>
  );
}