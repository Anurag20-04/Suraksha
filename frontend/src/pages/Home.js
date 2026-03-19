import React, { useState, useEffect } from 'react';
import Navbar from '../components/Layout/Navbar';
import BottomNav from '../components/Layout/BottomNav';
import SOSButton from '../components/Emergency/SOSButton';
import QuickActions from '../components/Home/QuickActions';
import RiskMeter from '../components/Home/RiskMeter';
import { useLocation } from '../hooks/useLocation';
import { useNetwork } from '../hooks/useNetwork';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const PhoneIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.23h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.71-1.71a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const EmergencyContacts = () => (
  <div className="contacts-section">
    <div className="section-label">EMERGENCY CONTACTS</div>
    <div className="contacts-list">
      {[
        { emoji: '🚔', name: 'Police Emergency', num: '100', bg: 'rgba(29,78,216,0.15)', color: 'var(--blue-pale)', tel: 'tel:100' },
        { emoji: '🚑', name: 'Ambulance', num: '102', bg: 'rgba(220,38,38,0.15)', color: 'var(--red-pale)', tel: 'tel:102' },
        { emoji: '🆘', name: 'Women Helpline', num: '1091', bg: 'rgba(225,29,116,0.15)', color: 'var(--pink-soft)', tel: 'tel:1091' },
      ].map((c) => (
        <div key={c.num} className="contact-row">
          <div className="contact-avatar" style={{ background: c.bg }}>
            <span>{c.emoji}</span>
          </div>
          <div className="contact-info">
            <div className="contact-name">{c.name}</div>
            <div className="contact-num" style={{ color: c.color }}>{c.num}</div>
          </div>
          <a href={c.tel} className="contact-call" style={{ background: c.bg, color: c.color }}>
            <PhoneIcon />
          </a>
        </div>
      ))}
    </div>
  </div>
);

const LocationPermBanner = ({ onGrant }) => (
  <div className="perm-banner">
    <div className="perm-banner__icon">📍</div>
    <div className="perm-banner__body">
      <div className="perm-banner__title">Enable Location</div>
      <div className="perm-banner__sub">Required for precise emergency alerts</div>
    </div>
    <button className="perm-banner__btn" onClick={onGrant}>Allow</button>
  </div>
);

const Home = () => {
  const { user } = useAuth();
  const { lat, lng, address, permission, requestLocation } = useLocation();
  const { isSlow, isOnline } = useNetwork();
  const [showCCTV, setShowCCTV] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good morning');
    else if (h < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const navRight = (
    <button className="nav-icon-btn" onClick={() => window.open('tel:100')} aria-label="Quick call police">
      <PhoneIcon />
    </button>
  );

  return (
    <div className="page-home">
      <Navbar rightContent={navRight} />

      {/* Network slow banner */}
      {(!isOnline || isSlow) && (
        <div className="network-banner">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M1 6s4-4 11-4 11 4 11 4M1 10s4-4 11-4 11 4 11 4M5 14s2.5-2 7-2 7 2 7 2M9 18s1.5-1 3-1 3 1 3 1"/>
          </svg>
          {!isOnline ? '⚠ Offline — SMS backup active' : '⚠ Slow network — emergency still works'}
        </div>
      )}

      {/* Location permission banner */}
      {permission === 'denied' && (
        <LocationPermBanner onGrant={requestLocation} />
      )}

      <div className="scroll-area home-scroll">
        {/* Hero greeting */}
        <div className="home-hero animate-slideUp">
          <div className="home-badge">
            <span className="home-badge__dot" />
            ACTIVE PROTECTION
          </div>
          <h1 className="home-title">
            {greeting}{user ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="home-sub">
            Your safety shield is active.{' '}
            {lat ? `📍 Location locked` : 'Enable location for precise alerts.'}
          </p>
        </div>

        {/* SOS — primary action */}
        <SOSButton location={{ lat, lng, address }} />

        {/* Spacer */}
        <div style={{ height: 8 }} />

        {/* Quick actions 2×2 grid */}
        <div className="section-label">QUICK ACTIONS</div>
        <QuickActions onCCTV={() => setShowCCTV(true)} />

        <div style={{ height: 20 }} />

        {/* Risk meter */}
        <div className="section-label">AREA SAFETY SCORE</div>
        <RiskMeter score={42} zoneName="NSHM Campus Area" />

        <div style={{ height: 20 }} />

        {/* Emergency contacts */}
        <EmergencyContacts />

        <div style={{ height: 20 }} />
      </div>

      <BottomNav />

      {/* CCTV Modal */}
      {showCCTV && <CCTVModal onClose={() => setShowCCTV(false)} />}
    </div>
  );
};

/* ── CCTV Modal ── */
const CCTVModal = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet animate-slideUp">
        <div className="modal-handle" />
        <div className="modal-header">
          <h2 className="modal-title text-gradient-pink">CCTV Live Access</h2>
          <p className="modal-sub">Campus surveillance network integration</p>
        </div>

        {/* Fake CCTV preview */}
        <div className="cctv-preview">
          <div className="cctv-scanline" />
          <div className="cctv-corner tl" /><div className="cctv-corner tr" />
          <div className="cctv-corner bl" /><div className="cctv-corner br" />
          <div className="cctv-center">
            <div className="cctv-icon">📷</div>
            <div className="cctv-status">◉ COMING SOON</div>
            <div className="cctv-desc">NSHM Campus Feed</div>
          </div>
        </div>

        <div className="cctv-info-card">
          🔗 CCTV integration with NSHM campus network is under active development.
          You'll be notified the moment it goes live.
        </div>

        {submitted ? (
          <div className="cctv-success">
            ✅ You're on the list! We'll notify you when CCTV goes live.
          </div>
        ) : (
          <div className="cctv-notify-form">
            <div className="section-label" style={{ padding: 0, marginBottom: 8 }}>NOTIFY ME WHEN LIVE</div>
            <input
              className="input-field"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              className="btn btn-pink"
              style={{ marginTop: 10 }}
              onClick={() => { if (email) setSubmitted(true); }}
            >
              Notify Me
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
