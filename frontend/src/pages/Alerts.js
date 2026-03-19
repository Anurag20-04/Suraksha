import React, { useState, useEffect } from 'react';
import Navbar from '../components/Layout/Navbar';
import BottomNav from '../components/Layout/BottomNav';
import { useAuth } from '../context/AuthContext';
import { alertAPI } from '../utils/api';
import './Alerts.css';

const statusConfig = {
  active:      { label: 'ACTIVE',      cls: 'critical', icon: '🔴' },
  resolved:    { label: 'RESOLVED',    cls: 'safe',     icon: '✅' },
  cancelled:   { label: 'CANCELLED',   cls: 'moderate', icon: '⚪' },
  false_alarm: { label: 'FALSE ALARM', cls: 'moderate', icon: '⚠️' },
};

const AlertCard = ({ alert }) => {
  const conf = statusConfig[alert.status] || statusConfig.resolved;
  const date = new Date(alert.createdAt);
  return (
    <div className="alert-card card">
      <div className="alert-card-header">
        <div className="alert-date">
          <div className="alert-day">{date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
          <div className="alert-time">{date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        <div className={`badge badge-${conf.cls}`}>{conf.icon} {conf.label}</div>
      </div>
      <div className="alert-location">
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        {alert.startLocation?.address || `${alert.startLocation?.lat?.toFixed(4)}, ${alert.startLocation?.lng?.toFixed(4)}`}
      </div>
      <div className="alert-meta-row">
        {alert.duration && <div className="alert-meta-item">⏱ {Math.floor(alert.duration / 60)}m {alert.duration % 60}s</div>}
        {alert.riskScore > 0 && <div className="alert-meta-item">⚡ Risk: {alert.riskScore}/100</div>}
        {alert.recordingType !== 'none' && <div className="alert-meta-item">🎙 {alert.recordingType} recorded</div>}
        <div className="alert-meta-item">📢 {alert.alertedContacts?.length || 0} notified</div>
      </div>
    </div>
  );
};

const Alerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    alertAPI.getMyAlerts()
      .then(({ data }) => setAlerts(data.alerts || []))
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="page-alerts">
      <Navbar title="SURAKSHA" />
      <div className="scroll-area" style={{ paddingTop: 16 }}>
        <div className="section-label">ALERT HISTORY</div>

        {!user ? (
          <div className="alerts-empty">
            <div className="alerts-empty-icon">🔒</div>
            <div className="alerts-empty-title">Login Required</div>
            <div className="alerts-empty-sub">Sign in to view your alert history and recordings</div>
          </div>
        ) : loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div className="spinner" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="alerts-empty">
            <div className="alerts-empty-icon">🛡️</div>
            <div className="alerts-empty-title">All Clear</div>
            <div className="alerts-empty-sub">No emergency alerts triggered. Stay safe!</div>
          </div>
        ) : (
          <div className="alerts-list">
            {alerts.map((a) => <AlertCard key={a._id} alert={a} />)}
          </div>
        )}

        {/* Safety stats if logged in */}
        {user && alerts.length > 0 && (
          <div className="alerts-stats card">
            <div className="section-label" style={{ padding: 0, marginBottom: 14 }}>YOUR SAFETY STATS</div>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-num">{alerts.length}</div>
                <div className="stat-label">Total Alerts</div>
              </div>
              <div className="stat-item">
                <div className="stat-num" style={{ color: 'var(--green-soft)' }}>
                  {alerts.filter(a => a.status === 'resolved').length}
                </div>
                <div className="stat-label">Resolved Safe</div>
              </div>
              <div className="stat-item">
                <div className="stat-num" style={{ color: 'var(--pink-soft)' }}>
                  {alerts.filter(a => a.recordingType !== 'none').length}
                </div>
                <div className="stat-label">Recorded</div>
              </div>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Alerts;
