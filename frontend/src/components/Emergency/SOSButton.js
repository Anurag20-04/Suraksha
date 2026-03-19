import React, { useState, useRef, useCallback } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { useNavigate } from 'react-router-dom';
import './SOSButton.css';

const SOSButton = ({ location }) => {
  const { isActive, triggerEmergency } = useEmergency();
  const navigate = useNavigate();
  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const holdTimer = useRef(null);
  const progressTimer = useRef(null);
  const HOLD_MS = 800;

  const startPress = useCallback(() => {
    if (isActive) return;
    setPressing(true);
    setProgress(0);

    const start = Date.now();
    progressTimer.current = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / HOLD_MS) * 100);
      setProgress(p);
    }, 16);

    holdTimer.current = setTimeout(async () => {
      clearInterval(progressTimer.current);
      setProgress(100);
      setPressing(false);
      await triggerEmergency(location);
      navigate('/emergency');
    }, HOLD_MS);
  }, [isActive, triggerEmergency, navigate, location]);

  const cancelPress = useCallback(() => {
    clearTimeout(holdTimer.current);
    clearInterval(progressTimer.current);
    setPressing(false);
    setProgress(0);
  }, []);

  const circumference = 2 * Math.PI * 48;

  return (
    <div className="sos-wrap">
      <div className="sos-label">PRESS &amp; HOLD FOR EMERGENCY</div>

      {/* Pulse rings — always visible on home */}
      <div className="sos-rings">
        <div className="sos-ring r1" />
        <div className="sos-ring r2" />
        <div className="sos-ring r3" />

        {/* Progress circle */}
        <svg className="sos-progress" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r="48"
            fill="none"
            stroke="rgba(220,38,38,0.2)"
            strokeWidth="3"
          />
          <circle cx="55" cy="55" r="48"
            fill="none"
            stroke={pressing ? '#DC2626' : 'rgba(153,27,27,0.5)'}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress / 100)}
            strokeLinecap="round"
            transform="rotate(-90 55 55)"
            style={{ transition: pressing ? 'none' : 'stroke-dashoffset 0.3s' }}
          />
        </svg>

        <button
          className={`sos-btn ${pressing ? 'pressing' : ''} ${isActive ? 'active-mode' : ''}`}
          onMouseDown={startPress}
          onMouseUp={cancelPress}
          onMouseLeave={cancelPress}
          onTouchStart={startPress}
          onTouchEnd={cancelPress}
          onTouchCancel={cancelPress}
          aria-label="Emergency SOS"
          disabled={isActive}
          onClick={isActive ? () => navigate('/emergency') : undefined}
        >
          <span className="sos-btn__text">{isActive ? '🔴' : 'SOS'}</span>
          <span className="sos-btn__sub">{isActive ? 'ACTIVE' : 'HOLD 1s'}</span>
        </button>
      </div>

      <div className="sos-hint">No login needed · Works offline · Calls Police &amp; Ambulance</div>
    </div>
  );
};

export default SOSButton;
