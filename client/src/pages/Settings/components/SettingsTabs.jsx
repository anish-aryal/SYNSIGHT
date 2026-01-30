import React from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { User, Bell, Palette, Shield, CreditCard } from 'lucide-react';

// Settings Tabs UI block for Settings page.

export default function SettingsTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Upgrade to Pro', icon: CreditCard }
  ];

  // Layout and appearance
  return (
    <div className="syn-pill-toggle">
      <Nav className="syn-pill-toggle-nav">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavItem key={tab.id}>
              <NavLink
                className={`syn-pill-toggle-btn ${activeTab === tab.id ? 'is-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </NavLink>
            </NavItem>
          );
        })}
      </Nav>
    </div>
  );
}
