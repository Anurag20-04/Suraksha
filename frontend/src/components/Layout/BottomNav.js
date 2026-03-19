import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NavItem = ({ path, label, icon, active, onClick }) => (
  <button className={`bottom-nav__item ${active ? 'active' : ''}`} onClick={onClick} aria-label={label}>
    {icon}
    <span>{label}</span>
  </button>
);

const HomeIcon = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const MapIcon = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
    <line x1="9" y1="3" x2="9" y2="18"/>
    <line x1="15" y1="6" x2="15" y2="21"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const ProfileIcon = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const items = [
    { path: '/',        label: 'Home',    icon: <HomeIcon /> },
    { path: '/map',     label: 'Map',     icon: <MapIcon /> },
    { path: '/alerts',  label: 'Alerts',  icon: <AlertIcon /> },
    { path: '/profile', label: 'Profile', icon: <ProfileIcon /> },
  ];

  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <NavItem
          key={item.path}
          {...item}
          active={path === item.path}
          onClick={() => navigate(item.path)}
        />
      ))}
    </nav>
  );
};

export default BottomNav;
