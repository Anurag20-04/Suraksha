import React, { useState } from 'react';
import Navbar from '../components/Layout/Navbar';
import BottomNav from '../components/Layout/BottomNav';
import { useAuth } from '../context/AuthContext';
import { contactAPI } from '../utils/api';
import './Profile.css';

/* ── Login Form ── */
const LoginForm = ({ onSwitch }) => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setError('All fields required'); return; }
    setLoading(true); setError('');
    try {
      await login(form.email, form.password);
    } catch (e) {
      setError(e.response?.data?.message || 'Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div className="auth-card card animate-scaleIn">
      <div className="auth-icon">🛡️</div>
      <h2 className="auth-title">Welcome Back</h2>
      <p className="auth-sub">Login to add personal contacts and access your alert history</p>

      <div className="auth-em-notice">
        🔴 Emergency SOS works WITHOUT login
      </div>

      <div className="input-wrap">
        <label className="input-label">EMAIL</label>
        <input className="input-field" type="email" placeholder="you@email.com"
          value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} />
      </div>
      <div className="input-wrap" style={{ marginTop: 12 }}>
        <label className="input-label">PASSWORD</label>
        <input className="input-field" type="password" placeholder="••••••••"
          value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />
      </div>

      {error && <div className="auth-error">{error}</div>}

      <button className="btn btn-pink" style={{ marginTop: 20 }} onClick={handleSubmit} disabled={loading}>
        {loading ? <><div className="spinner" /> Signing In…</> : 'Sign In Securely'}
      </button>

      <div className="auth-divider"><span>or</span></div>

      <button className="btn btn-outline" onClick={onSwitch}>Create Account</button>
    </div>
  );
};

/* ── Register Form ── */
const RegisterForm = ({ onSwitch }) => {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', institution: 'NSHM Knowledge Campus' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone || !form.password) { setError('All fields required'); return; }
    setLoading(true); setError('');
    try {
      await register(form);
    } catch (e) {
      setError(e.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-card card animate-scaleIn">
      <div className="auth-icon">✨</div>
      <h2 className="auth-title">Create Account</h2>
      <p className="auth-sub">Join SURAKSHA for full safety features</p>

      {[
        { k: 'name', label: 'FULL NAME', placeholder: 'Priya Sharma', type: 'text' },
        { k: 'email', label: 'EMAIL', placeholder: 'you@nshm.edu.in', type: 'email' },
        { k: 'phone', label: 'PHONE', placeholder: '+91 9876543210', type: 'tel' },
        { k: 'password', label: 'PASSWORD', placeholder: '••••••••', type: 'password' },
      ].map(({ k, label, placeholder, type }) => (
        <div key={k} className="input-wrap" style={{ marginTop: 12 }}>
          <label className="input-label">{label}</label>
          <input className="input-field" type={type} placeholder={placeholder}
            value={form[k]} onChange={set(k)} />
        </div>
      ))}

      {error && <div className="auth-error">{error}</div>}

      <button className="btn btn-pink" style={{ marginTop: 20 }} onClick={handleSubmit} disabled={loading}>
        {loading ? <><div className="spinner" /> Creating Account…</> : 'Create Account'}
      </button>

      <div className="auth-divider"><span>or</span></div>
      <button className="btn btn-outline" onClick={onSwitch}>Already have an account</button>
    </div>
  );
};

/* ── Logged In Profile ── */
const LoggedInProfile = () => {
  const { user, logout } = useAuth();
  const [contacts, setContacts] = useState(user?.emergencyContacts || []);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: '' });
  const [adding, setAdding] = useState(false);

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) return;
    setAdding(true);
    try {
      const { data } = await contactAPI.add(newContact);
      setContacts(data.contacts);
      setNewContact({ name: '', phone: '', relation: '' });
      setShowAddContact(false);
    } catch {
      alert('Failed to add contact');
    }
    setAdding(false);
  };

  const handleRemoveContact = async (id) => {
    try {
      const { data } = await contactAPI.remove(id);
      setContacts(data.contacts);
    } catch { alert('Failed to remove'); }
  };

  return (
    <div className="animate-fadeIn">
      {/* Profile header */}
      <div className="profile-header">
        <div className="profile-avatar">{initials}</div>
        <div>
          <div className="profile-name">{user?.name}</div>
          <div className="profile-email">{user?.email}</div>
          <div className="profile-verified">
            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="#4ADE80" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            Verified Account
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* Emergency contacts */}
      <div className="section-label">MY EMERGENCY CONTACTS</div>
      <div style={{ padding: '0 16px' }}>
        {/* Default system contacts */}
        {[{ name: 'Police', phone: '100', relation: 'Emergency' }, { name: 'Ambulance', phone: '102', relation: 'Emergency' }, { name: 'Women Helpline', phone: '1091', relation: 'Emergency' }].map(c => (
          <div key={c.phone} className="contact-row-profile system">
            <div className="crp-avatar system-avatar">{c.name[0]}</div>
            <div className="crp-info">
              <div className="crp-name">{c.name}</div>
              <div className="crp-rel">System · Always active</div>
            </div>
            <div className="crp-num">{c.phone}</div>
          </div>
        ))}

        {/* User contacts */}
        {contacts.map((c) => (
          <div key={c._id} className="contact-row-profile">
            <div className="crp-avatar user-avatar">{c.name[0]}</div>
            <div className="crp-info">
              <div className="crp-name">{c.name}</div>
              <div className="crp-rel">{c.relation}</div>
            </div>
            <div className="crp-num">{c.phone}</div>
            <button className="crp-del" onClick={() => handleRemoveContact(c._id)} aria-label="Remove">✕</button>
          </div>
        ))}

        {showAddContact ? (
          <div className="add-contact-form">
            {[
              { k: 'name', placeholder: 'Contact name (e.g. Mom)', type: 'text' },
              { k: 'phone', placeholder: 'Phone number', type: 'tel' },
              { k: 'relation', placeholder: 'Relation (e.g. Mother)', type: 'text' },
            ].map(({ k, placeholder, type }) => (
              <input key={k} className="input-field" type={type} placeholder={placeholder}
                style={{ marginBottom: 8 }}
                value={newContact[k]} onChange={(e) => setNewContact(p => ({ ...p, [k]: e.target.value }))} />
            ))}
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-pink" onClick={handleAddContact} disabled={adding}>
                {adding ? 'Adding…' : 'Add Contact'}
              </button>
              <button className="btn btn-outline" onClick={() => setShowAddContact(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <button className="btn btn-outline" style={{ marginTop: 10 }} onClick={() => setShowAddContact(true)}>
            + Add Emergency Contact
          </button>
        )}
      </div>

      <div className="divider" />

      {/* Settings */}
      <div className="section-label">SETTINGS</div>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {[
          { icon: '🔔', label: 'Notifications', sub: 'Push alerts enabled' },
          { icon: '📍', label: 'Location Sharing', sub: 'Always active' },
          { icon: '🎙', label: 'Auto Recording', sub: 'On emergency trigger' },
          { icon: '🔐', label: 'Privacy & Security', sub: 'Data encrypted' },
        ].map(({ icon, label, sub }) => (
          <div key={label} className="settings-row">
            <div className="sr-icon">{icon}</div>
            <div className="sr-body">
              <div className="sr-label">{label}</div>
              <div className="sr-sub">{sub}</div>
            </div>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        ))}

        <button className="btn btn-outline" style={{ marginTop: 12, color: 'var(--red-pale)', borderColor: 'rgba(220,38,38,0.2)' }} onClick={logout}>
          Sign Out
        </button>
      </div>

      <div style={{ height: 20 }} />
    </div>
  );
};

/* ── Main Profile Page ── */
const Profile = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState('login'); // login | register

  return (
    <div className="page-profile">
      <Navbar />
      <div className="scroll-area">
        {user ? (
          <LoggedInProfile />
        ) : (
          <div style={{ padding: '20px 16px' }}>
            {mode === 'login'
              ? <LoginForm onSwitch={() => setMode('register')} />
              : <RegisterForm onSwitch={() => setMode('login')} />
            }
            <p className="auth-footer-note">
              🔒 Your data is encrypted and never shared
            </p>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;
