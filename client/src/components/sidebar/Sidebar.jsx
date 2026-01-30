import React, { useState } from 'react';
import {
  MessageSquare,
  LayoutDashboard,
  FolderOpen,
  FileText,
  History,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Flame
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Nav, NavItem, NavLink, Navbar, NavbarBrand } from 'reactstrap';
import { useAuth } from '../../api/context/AuthContext';
import SynsightLogo from '../SynsightLogo';

// Sidebar sidebar UI component.

export default function Sidebar({ mode = 'full' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: MessageSquare, label: 'Chat', path: '/chat' },
    { icon: History, label: 'Chat History', path: '/history' },
    { icon: LayoutDashboard, label: 'Overview', path: '/overview' },
    { icon: FolderOpen, label: 'Projects', path: '/projects' },
    { icon: Flame, label: 'Trending', path: '/explore' },
    { icon: FileText, label: 'Reports', path: '/reports' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ];

  const isActive = (path) => location.pathname === path;
  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const closeSidebar = () => setIsOpen(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    // Layout and appearance
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const showMobile = mode !== 'desktop';
  const showDesktop = mode !== 'mobile';

  const SidebarNav = ({ onItemClick }) => (
    <Nav vertical className="flex-grow-1 p-3">
      {menuItems.map((item) => (
        <NavItem key={item.path}>
          <NavLink
            tag={Link}
            to={item.path}
            onClick={onItemClick}
            className={`d-flex align-items-center gap-3 px-3 py-2 rounded text-decoration-none ${
              isActive(item.path)
                ? 'bg-primary bg-opacity-10 text-primary fw-medium'
                : 'text-secondary'
            }`}
            style={{ cursor: 'pointer' }}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        </NavItem>
      ))}
    </Nav>
  );

  const SidebarProfile = () => (
    <div className="p-3 border-top">
      <div className="d-flex align-items-center gap-3 mb-3">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.fullName}
            className="rounded-circle"
            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
          />
        ) : (
          <div
            className="d-flex align-items-center justify-content-center rounded-circle text-white"
            style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #155DFC 0%, #9810FA 100%)'
            }}
          >
            <span className="fw-semibold">{getInitials(user?.fullName)}</span>
          </div>
        )}
        <div className="flex-grow-1 text-truncate">
          <div className="fw-medium small">{user?.fullName || 'User'}</div>
          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
            {user?.email || 'email@example.com'}
          </div>
        </div>
      </div>
      <NavLink
        onClick={handleLogout}
        className="d-flex align-items-center gap-2 text-secondary text-decoration-none"
        style={{ cursor: 'pointer', fontSize: '0.875rem' }}
      >
        <LogOut size={18} />
        <span>Logout</span>
      </NavLink>
    </div>
  );

  const DesktopSidebar = () => (
    <div className="sidebar-panel d-none d-lg-flex flex-column bg-white border-end">
      <div className="p-4 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <div className="d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
            <SynsightLogo width={58} height={52} />
          </div>
          <h5 className="mb-0 fw-bold">SYNSIGHT</h5>
        </div>
      </div>
      <SidebarNav />
      <SidebarProfile />
    </div>
  );

  const MobileDrawer = () => (
    <div className="sidebar-drawer d-lg-none position-fixed start-0 top-0 bg-white border-end">
      <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center bg-primary text-white rounded"
            style={{ width: '32px', height: '32px' }}
          >
            <BarChart3 size={20} />
          </div>
          <h5 className="mb-0 fw-bold">SYNSIGHT</h5>
        </div>
        <button
          className="btn btn-link text-dark p-0 border-0"
          onClick={closeSidebar}
          aria-label="Close menu"
        >
          <X size={24} />
        </button>
      </div>
      <SidebarNav onItemClick={closeSidebar} />
      <SidebarProfile />
    </div>
  );

  return (
    <>
      {showMobile && (
        <Navbar className="d-lg-none bg-white border-bottom fixed-top px-3" style={{ zIndex: 1050 }}>
          <NavbarBrand className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center justify-content-center bg-primary text-white rounded"
              style={{ width: '32px', height: '32px' }}
            >
              <BarChart3 size={20} />
            </div>
            <span className="fw-bold">SYNSIGHT</span>
          </NavbarBrand>
          <button
            className="btn btn-link text-dark p-0 border-0"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>
        </Navbar>
      )}

      {showMobile && isOpen && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={closeSidebar}
        />
      )}

      {showMobile && isOpen ? <MobileDrawer /> : null}
      {showDesktop ? <DesktopSidebar /> : null}
    </>
  );
}
