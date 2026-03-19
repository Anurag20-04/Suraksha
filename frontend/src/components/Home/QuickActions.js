import React from 'react';
import { useNavigate } from 'react-router-dom';
import './QuickActions.css';

const actions = [
  {
    id: 'nav',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#3B82F6" strokeWidth="2">
        <path d="M3 11l19-9-9 19-2-8-8-2z"/>
      </svg>
    ),
    iconBg: 'rgba(29,78,216,0.18)',
    label: 'Safe Route',
    sub: 'Find safest way',
    path: '/map',
    accentCls: 'blue',
  },
  {
    id: 'map',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#16A34A" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    iconBg: 'rgba(22,163,74,0.18)',
    label: 'Risk Map',
    sub: 'Danger zones',
    path: '/map',
    accentCls: 'green',
  },
  {
    id: 'police',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#FCA5A5" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.23h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.71-1.71a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
    iconBg: 'rgba(153,27,27,0.25)',
    label: 'Call Police',
    sub: 'Dial 100 now',
    tel: 'tel:100',
    accentCls: 'red',
  },
  {
    id: 'cctv',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#E11D74" strokeWidth="2">
        <rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/>
      </svg>
    ),
    iconBg: 'rgba(225,29,116,0.15)',
    label: 'CCTV Feed',
    sub: '',
    badge: 'SOON',
    disabled: true,
    accentCls: 'pink',
  },
];

const QuickActions = ({ onCCTV }) => {
  const navigate = useNavigate();

  const handleClick = (action) => {
    if (action.disabled) { onCCTV && onCCTV(); return; }
    if (action.tel) { window.open(action.tel); return; }
    if (action.path) navigate(action.path);
  };

  return (
    <div className="quick-grid">
      {actions.map((a) => (
        <button
          key={a.id}
          className={`quick-card ${a.accentCls} ${a.disabled ? 'disabled' : ''}`}
          onClick={() => handleClick(a)}
        >
          <div className="quick-icon" style={{ background: a.iconBg }}>{a.icon}</div>
          <div className="quick-info">
            <div className="quick-label">{a.label}</div>
            {a.sub && <div className="quick-sub">{a.sub}</div>}
            {a.badge && <span className="badge badge-pink" style={{ marginTop: 4, fontSize: 9 }}>{a.badge}</span>}
          </div>
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
