// import React from 'react';
// import { Nav, NavItem, NavLink } from 'reactstrap';
// import { TrendingUp, Clock } from 'lucide-react';

// export default function FilterTabs({ activeTab, setActiveTab }) {
//   return (
//     <Nav className="mb-4">
//       <NavItem>
//         <NavLink
//           className={`d-flex align-items-center gap-2 px-3 py-2 rounded-2 border-0 ${
//             activeTab === 'trending' 
//               ? 'bg-light text-dark fw-medium' 
//               : 'text-muted bg-transparent'
//           }`}
//           style={{ cursor: 'pointer' }}
//           onClick={() => setActiveTab('trending')}
//         >
//           <TrendingUp size={16} />
//           <span>Trending</span>
//         </NavLink>
//       </NavItem>
//       <NavItem>
//         <NavLink
//           className={`d-flex align-items-center gap-2 px-3 py-2 rounded-2 border-0 ${
//             activeTab === 'recent' 
//               ? 'bg-light text-dark fw-medium' 
//               : 'text-muted bg-transparent'
//           }`}
//           style={{ cursor: 'pointer' }}
//           onClick={() => setActiveTab('recent')}
//         >
//           <Clock size={16} />
//           <span>Recent</span>
//         </NavLink>
//       </NavItem>
//     </Nav>
//   );
// }
import React from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TrendingUp, Clock } from 'lucide-react';

export default function FilterTabs({ activeTab, setActiveTab }) {
  return (
    <div className="mb-4">
      <div className="p-1 bg-white rounded-3 d-inline-flex border">
        <Nav className="gap-1">
          <NavItem>
            <NavLink
              className={`d-flex align-items-center gap-2 px-4 py-2 rounded-2 border-0 ${
                activeTab === 'trending' 
                  ? 'gradient-primary text-white fw-semibold' 
                  : 'text-dark bg-transparent'
              }`}
              style={{ 
                cursor: 'pointer', 
                transition: 'all 0.2s ease',
                minWidth: '120px',
                justifyContent: 'center'
              }}
              onClick={() => setActiveTab('trending')}
            >
              <TrendingUp size={18} />
              <span>Trending</span>
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={`d-flex align-items-center gap-2 px-4 py-2 rounded-2 border-0 ${
                activeTab === 'recent' 
                  ? 'gradient-primary text-white fw-semibold' 
                  : 'text-dark bg-transparent'
              }`}
              style={{ 
                cursor: 'pointer', 
                transition: 'all 0.2s ease',
                minWidth: '120px',
                justifyContent: 'center'
              }}
              onClick={() => setActiveTab('recent')}
            >
              <Clock size={18} />
              <span>Recent</span>
            </NavLink>
          </NavItem>
        </Nav>
      </div>
    </div>
  );
}