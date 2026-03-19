import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmergency } from '../context/EmergencyContext';
import './EmergencyScreen.css';

const CheckIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#4ADE80" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const StatusItem = ({ label, sub, state = 'ACTIVE', delay = 0 }) => (
  <div className="em-status-item animate-slideUp" style={{ animationDelay: `${delay}s` }}>
    <div className="em-status-left">
      <div className="em-check"><CheckIcon /></div>
      <div>
        <div className="em-item-label">{label}</div>
        {sub && <div className="em-item-sub">{sub}</div>}
      </div>
    </div>
    <div className="em-item-state">{state}</div>
  </div>
);

const EmergencyScreen = () => {
  const navigate = useNavigate();
  const {
    isActive, formattedTime, alertedContacts,
    recordingState, locationState, riskScore,
    cancelEmergency,
  } = useEmergency();

  useEffect(() => {
    if (!isActive) navigate('/');
  }, [isActive, navigate]);

  const handleCancel = async () => {
    await cancelEmergency();
    navigate('/');
  };

  const recordingLabel = {
    recording: 'Recording',
    secured: 'Secured',
    failed: 'Location Only',
    idle: 'Starting…',
  }[recordingState] || 'Recording';

  return (
    <div className="em-screen">
      {/* Red atmospheric overlay */}
      <div className="em-overlay" />

      <div className="em-content">
        {/* Header */}
        <div className="em-header animate-fadeIn">
          <div className="em-active-pill">
            <span className="em-blink" />
            <span>EMERGENCY ACTIVE</span>
          </div>
          <h1 className="em-title">Help is<br />on the way</h1>
          <p className="em-subtitle">Stay calm · Keep your phone with you</p>
        </div>

        {/* Timer */}
        <div className="em-timer-wrap animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <div className="em-timer">{formattedTime}</div>
          <div className="em-timer-label">TIME ELAPSED</div>
        </div>

        {/* Status grid */}
        <div className="em-status-grid">
          <StatusItem
            label="Audio Recording"
            sub={recordingState === 'secured' ? 'Evidence secured' : 'Capturing audio'}
            state={recordingState === 'failed' ? 'SKIPPED' : recordingLabel.toUpperCase()}
            delay={0.15}
          />
          <StatusItem
            label="Location Shared"
            sub={locationState.lat
              ? `${locationState.lat.toFixed(4)}, ${locationState.lng.toFixed(4)}`
              : 'Acquiring GPS…'}
            state="LIVE"
            delay={0.25}
          />
          <StatusItem
            label="Alert Dispatched"
            sub={`Risk Score: ${riskScore}/100`}
            state="SENT"
            delay={0.35}
          />
        </div>

        {/* Alerted contacts */}
        <div className="em-contacts animate-slideUp" style={{ animationDelay: '0.45s' }}>
          <div className="em-contacts-title">ALERT DELIVERED TO</div>
          <div className="em-contacts-list">
            {(alertedContacts.length ? alertedContacts : [
              { name: 'Police', phone: '100' },
              { name: 'Ambulance', phone: '102' },
            ]).map((c, i) => (
              <div key={i} className="em-contact-row">
                <span className="em-contact-check">✔</span>
                <span className="em-contact-name">{c.name}</span>
                <span className="em-contact-num">{c.phone}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick calls */}
        <div className="em-quick-calls animate-slideUp" style={{ animationDelay: '0.55s' }}>
          <a href="tel:100" className="em-call-btn police">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.23h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.71-1.71a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            Call Police (100)
          </a>
          <a href="tel:102" className="em-call-btn amb">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.23h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.71-1.71a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            Ambulance (102)
          </a>
        </div>

        {/* Cancel */}
        <button className="em-cancel-btn animate-slideUp" style={{ animationDelay: '0.6s' }} onClick={handleCancel}>
          Cancel Emergency Alert
        </button>
      </div>
    </div>
  );
};

export default EmergencyScreen;
