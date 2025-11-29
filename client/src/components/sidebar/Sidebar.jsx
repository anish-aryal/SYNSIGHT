import React, { useState } from 'react';
import {
  MessageSquare,
  LayoutDashboard,
  FolderOpen,
  Compass,
  FileText,
  History,
  Database,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Nav, NavItem, NavLink, Navbar, NavbarBrand } from 'reactstrap';
import { useAuth } from '../../api/context/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: MessageSquare, label: 'Chat', path: '/chat' },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FolderOpen, label: 'Projects', path: '/projects' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: FileText, label: 'Reports', path: '/reports' },
    { icon: History, label: 'History', path: '/history' },
    { icon: Database, label: 'Data Sources', path: '/data-sources' },
    { icon: BarChart3, label: 'Model & Analysis', path: '/model-analysis' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ];

  const isActive = (path) => location.pathname === path;
  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <>
      {/* Mobile Navbar */}
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

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={closeSidebar}
        />
      )}

      <div
        className={`d-flex flex-column vh-100 bg-white border-end ${
          isOpen
            ? 'position-fixed start-0 top-0'
            : 'position-fixed start-0 top-0 d-none d-lg-flex'
        }`}
        style={{ width: '260px', zIndex: 1045, transition: 'transform 0.3s ease-in-out' }}
      >
        {/* Close button for mobile */}
        <div className="d-lg-none d-flex justify-content-between align-items-center p-3 border-bottom">
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

        {/* Logo Section */}
        <div className="p-4 border-bottom d-none d-lg-block">
          <div className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center justify-content-center"
              style={{ width: '32px', height: '32px' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="58" height="52" viewBox="0 0 58 52" fill="none">
                <path
                  d="M3.422 24.6106L25.2981 47.3267C26.0234 48.0798 27.0181 48.5139 28.0634 48.5336C29.1087 48.5533 30.1191 48.157 30.8722 47.4317L53.5883 25.5556"
                  stroke="url(#paint0_linear_12_2212)"
                  strokeWidth="6.84402"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M38.6003 28.0698V12.3013"
                  stroke="url(#paint1_linear_12_2212)"
                  strokeWidth="6.84402"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M28.7445 28.0698V4.41702"
                  stroke="url(#paint2_linear_12_2212)"
                  strokeWidth="6.84402"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18.8895 28.0698V22.1566"
                  stroke="url(#paint3_linear_12_2212)"
                  strokeWidth="6.84402"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="paint0_linear_12_2212" x1="3.422" y1="24.6106" x2="53.5883" y2="25.5556" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#155DFC" />
                    <stop offset="1" stopColor="#9810FA" />
                  </linearGradient>
                  <linearGradient id="paint1_linear_12_2212" x1="38.6003" y1="12.3013" x2="40.5923" y2="12.4276" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#155DFC" />
                    <stop offset="1" stopColor="#9810FA" />
                  </linearGradient>
                  <linearGradient id="paint2_linear_12_2212" x1="28.7445" y1="4.41702" x2="30.7409" y2="4.50143" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#155DFC" />
                    <stop offset="1" stopColor="#9810FA" />
                  </linearGradient>
                  <linearGradient id="paint3_linear_12_2212" x1="18.8895" y1="22.1566" x2="20.8339" y2="22.4854" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#155DFC" />
                    <stop offset="1" stopColor="#9810FA" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h5 className="mb-0 fw-bold">SYNSIGHT</h5>
          </div>
        </div>

        {/* Navigation */}
        <Nav vertical className="flex-grow-1 p-3">
          {menuItems.map((item, index) => (
            <NavItem key={index}>
              <NavLink
                tag={Link}
                to={item.path}
                onClick={closeSidebar}
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

        {/* User Profile Section */}
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
      </div>
    </>
  );
}