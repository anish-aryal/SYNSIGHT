import React from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { User, Bell, Palette, Shield, CreditCard } from 'lucide-react';

export default function SettingsTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard }
  ];

  return (
    <div className="p-1 bg-white rounded-3 d-inline-flex border">
    <Nav className="settings-tabs gap-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavItem key={tab.id}>
            <NavLink
              className={`d-flex align-items-center gap-2 px-4 py-2 rounded-2 fw-medium ${
                activeTab === tab.id
                  ? 'gradient-primary text-white'
                  : 'text-muted bg-white'
              }`}
              style={{ cursor: 'pointer'}}
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