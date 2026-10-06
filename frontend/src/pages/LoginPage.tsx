import React, { useState, useId } from 'react';
import { Sprout, User, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

type LoginRole = 'farmer' | 'admin';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const usernameId = useId();
  const passwordId = useId();

  const [selectedRole, setSelectedRole] = useState<LoginRole>('farmer');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill credentials when role tab is clicked
  const handleRoleSelect = (role: LoginRole) => {
    setSelectedRole(role);
    setError(null);
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('farmer');
      setPassword('farmer123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.login(username.trim(), password);
      login({
        username: res.username,
        role: res.role,
        full_name: res.full_name,
        token: res.access_token,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* Animated background blobs */}
      <div className="login-blob login-blob-1" aria-hidden="true" />
      <div className="login-blob login-blob-2" aria-hidden="true" />
      <div className="login-blob login-blob-3" aria-hidden="true" />

      <div className="login-card" role="main">
        {/* Logo */}
        <div className="login-logo-wrap">
          <div className="login-logo-icon">
            <Sprout className="login-logo-svg" />
          </div>
        </div>

        <h1 className="login-title">KisanMitra</h1>
        <p className="login-subtitle">Farm decisions, made simple</p>

        {/* Role selector */}
        <div className="login-role-tabs" role="tablist" aria-label="Login as">
          <button
            id="tab-farmer"
            role="tab"
            aria-selected={selectedRole === 'farmer'}
            className={`login-role-tab ${selectedRole === 'farmer' ? 'login-role-tab--active' : ''}`}
            onClick={() => handleRoleSelect('farmer')}
            type="button"
          >
            <span className="login-role-dot login-role-dot--farmer" />
            Farmer
          </button>
          <button
            id="tab-admin"
            role="tab"
            aria-selected={selectedRole === 'admin'}
            className={`login-role-tab ${selectedRole === 'admin' ? 'login-role-tab--active' : ''}`}
            onClick={() => handleRoleSelect('admin')}
            type="button"
          >
            <span className="login-role-dot login-role-dot--admin" />
            Admin
          </button>
        </div>

        {/* Hint */}
        <p className="login-hint">
          {selectedRole === 'farmer'
            ? 'Demo: farmer / farmer123'
            : 'Demo: admin / admin123'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {/* Username */}
          <div className="login-field">
            <label htmlFor={usernameId} className="login-label">Username</label>
            <div className="login-input-wrap">
              <User className="login-input-icon" aria-hidden="true" />
              <input
                id={usernameId}
                type="text"
                autoComplete="username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(null); }}
                className="login-input"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="login-field">
            <label htmlFor={passwordId} className="login-label">Password</label>
            <div className="login-input-wrap">
              <Lock className="login-input-icon" aria-hidden="true" />
              <input
                id={passwordId}
                type={showPwd ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                className="login-input login-input--password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPwd((p) => !p)}
                aria-label={showPwd ? 'Hide password' : 'Show password'}
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="login-error" role="alert">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            id="login-submit-btn"
            type="submit"
            className={`login-btn ${selectedRole === 'admin' ? 'login-btn--admin' : 'login-btn--farmer'}`}
            disabled={loading}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
            ) : (
              `Sign in as ${selectedRole === 'admin' ? 'Admin' : 'Farmer'}`
            )}
          </button>
        </form>

        {/* SDG badges */}
        <div className="login-sdg-row">
          {['SDG 2', 'SDG 6', 'SDG 12', 'SDG 14'].map((s) => (
            <span key={s} className="login-sdg-badge">{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
