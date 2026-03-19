import React from 'react';
import './RiskMeter.css';

const getRiskColor = (score) => {
  if (score < 35) return { color: 'var(--green-soft)', label: 'SAFE', cls: 'safe' };
  if (score < 60) return { color: 'var(--yellow-soft)', label: 'MODERATE', cls: 'moderate' };
  if (score < 75) return { color: 'var(--red-pale)', label: 'HIGH RISK', cls: 'high' };
  return { color: '#FF6B6B', label: 'CRITICAL', cls: 'critical' };
};

const NSHM_ZONES = [
  { name: 'NSHM Main Gate', score: 25, tags: 'guarded, lit' },
  { name: 'Hostel Road', score: 45, tags: 'low-light' },
  { name: 'Market Area', score: 50, tags: 'crowded' },
  { name: 'Durgapur Station Rd', score: 60, tags: 'high-traffic' },
  { name: 'Dark Side Streets', score: 70, tags: 'no CCTV' },
  { name: 'Industrial Stretch', score: 75, tags: 'isolated' },
  { name: 'Isolated Bypass', score: 80, tags: 'critical' },
];

const ZoneRow = ({ zone }) => {
  const { color, cls } = getRiskColor(zone.score);
  return (
    <div className="zone-row">
      <div className="zone-left">
        <div className="zone-dot" style={{ background: color }} />
        <div>
          <div className="zone-name">{zone.name}</div>
          <div className="zone-tag">{zone.tags}</div>
        </div>
      </div>
      <div className={`zone-score ${cls}`} style={{ color }}>{zone.score}</div>
    </div>
  );
};

const RiskMeter = ({ score = 42, zoneName = 'NSHM Campus Area', compact = false }) => {
  const { color, label, cls } = getRiskColor(score);

  return (
    <div className="risk-card card animate-slideUp delay-300">
      <div className="risk-header">
        <div className="risk-location">
          <div className="risk-pin">📍</div>
          <span>{zoneName}</span>
        </div>
        <div className={`badge badge-${cls}`}>{label}</div>
      </div>

      <div className="risk-score-row">
        <span className="risk-score-num" style={{ color }}>{score}</span>
        <span className="risk-score-denom">/100</span>
      </div>

      <div className="risk-bar-track">
        <div
          className="risk-bar-fill"
          style={{ width: `${score}%` }}
        />
      </div>

      {!compact && (
        <>
          <div className="risk-divider" />
          <div className="risk-zones-title">NEARBY ZONES</div>
          <div className="risk-zones">
            {NSHM_ZONES.map((z) => <ZoneRow key={z.name} zone={z} />)}
          </div>
        </>
      )}
    </div>
  );
};

export default RiskMeter;
