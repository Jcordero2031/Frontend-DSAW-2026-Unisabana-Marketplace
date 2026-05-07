import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { validators, validateForm } from '../utils/validators';
import './Profile.css';

const Profile = () => {
  const { user, updateLocalUser, logout, isSeller } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('info');
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  const setPw = (field) => (e) => {
    setPwForm(f => ({ ...f, [field]: e.target.value }));
    if (pwErrors[field]) setPwErrors(p => ({ ...p, [field]: null }));
    setPwSuccess(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const rules = {
      current: [v => validators.required(v, 'Contraseña actual')],
      next: [v => validators.required(v, 'Nueva contraseña'), v => validators.minLength(v, 6, 'Nueva contraseña')],
      confirm: [v => validators.match(v, pwForm.next, 'Las contraseñas')],
    };
    const { isValid, errors } = validateForm(pwForm, rules);
    if (!isValid) { setPwErrors(errors); return; }

    setPwLoading(true);
    try {
      await authService.changePassword({ currentPassword: pwForm.current, newPassword: pwForm.next });
      setPwSuccess(true);
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwErrors({ current: err.response?.data?.error || 'Error al cambiar contraseña' });
    }
    setPwLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleLabel = () => {
    if (user?.role === 'admin' || user?.roles?.includes('admin')) return 'Administrador';
    if (isSeller()) return 'Vendedor';
    return 'Comprador';
  };

  const roleIcon = () => {
    if (user?.role === 'admin' || user?.roles?.includes('admin')) return '🛡️';
    if (isSeller()) return '🏪';
    return '🎓';
  };

  return (
    <div className="profile-page">
      <div className="container profile-wrap">
        {/* Sidebar */}
        <div className="profile-sidebar">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="profile-role-badge">{roleIcon()} {roleLabel()}</div>
          </div>
          <h2 className="profile-name">{user?.name}</h2>
          <p className="profile-email">{user?.email}</p>

          <nav className="profile-nav">
            <button className={`profile-nav-item ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>
              👤 Mi información
            </button>
            <button className={`profile-nav-item ${tab === 'password' ? 'active' : ''}`} onClick={() => setTab('password')}>
              🔒 Cambiar contraseña
            </button>
            {!isSeller() && (
              <button className="profile-nav-item" onClick={() => navigate('/become-seller')}>
                🏪 Ser vendedor
              </button>
            )}
            {isSeller() && (
              <>
                <button className="profile-nav-item" onClick={() => navigate('/my-products')}>📦 Mis productos</button>
                <button className="profile-nav-item" onClick={() => navigate('/my-sales')}>💰 Mis ventas</button>
              </>
            )}
            <button className="profile-nav-item" onClick={() => navigate('/my-orders')}>🛍️ Mis compras</button>
            <button className="profile-nav-item" onClick={() => navigate('/conversations')}>💬 Mensajes</button>
            <button className="profile-nav-item danger" onClick={handleLogout}>🚪 Cerrar sesión</button>
          </nav>
        </div>

        {/* Content */}
        <div className="profile-content">
          {tab === 'info' && (
            <div className="profile-card">
              <h2 className="profile-card-title">Mi información</h2>
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <label>Nombre completo</label>
                  <div className="profile-info-value">{user?.name}</div>
                </div>
                <div className="profile-info-item">
                  <label>Correo institucional</label>
                  <div className="profile-info-value">{user?.email}</div>
                </div>
                <div className="profile-info-item">
                  <label>Rol en el marketplace</label>
                  <div className="profile-info-value">{roleIcon()} {roleLabel()}</div>
                </div>
                {user?.career && (
                  <div className="profile-info-item">
                    <label>Carrera</label>
                    <div className="profile-info-value">{user.career}</div>
                  </div>
                )}
              </div>

              <div className="profile-quick-links">
                <h3>Accesos rápidos</h3>
                <div className="profile-quick-grid">
                  <div className="profile-quick-card" onClick={() => navigate('/my-orders')}>
                    <span className="pq-icon">🛍️</span>
                    <span>Mis compras</span>
                  </div>
                  <div className="profile-quick-card" onClick={() => navigate('/conversations')}>
                    <span className="pq-icon">💬</span>
                    <span>Mensajes</span>
                  </div>
                  {isSeller() && (
                    <>
                      <div className="profile-quick-card" onClick={() => navigate('/my-products')}>
                        <span className="pq-icon">📦</span>
                        <span>Mis productos</span>
                      </div>
                      <div className="profile-quick-card" onClick={() => navigate('/my-sales')}>
                        <span className="pq-icon">💰</span>
                        <span>Mis ventas</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === 'password' && (
            <div className="profile-card">
              <h2 className="profile-card-title">Cambiar contraseña</h2>
              {pwSuccess && <div className="alert alert-success">✅ Contraseña actualizada correctamente.</div>}
              <form onSubmit={handleChangePassword} noValidate>
                <div className="form-group">
                  <label className="form-label">Contraseña actual</label>
                  <input type="password" className={`input ${pwErrors.current ? 'error' : ''}`} value={pwForm.current} onChange={setPw('current')} placeholder="Tu contraseña actual" />
                  {pwErrors.current && <span className="form-error">{pwErrors.current}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Nueva contraseña</label>
                  <input type="password" className={`input ${pwErrors.next ? 'error' : ''}`} value={pwForm.next} onChange={setPw('next')} placeholder="Mínimo 6 caracteres" />
                  {pwErrors.next && <span className="form-error">{pwErrors.next}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Confirmar nueva contraseña</label>
                  <input type="password" className={`input ${pwErrors.confirm ? 'error' : ''}`} value={pwForm.confirm} onChange={setPw('confirm')} placeholder="Repite la nueva contraseña" />
                  {pwErrors.confirm && <span className="form-error">{pwErrors.confirm}</span>}
                </div>
                <button type="submit" className="btn btn-primary" disabled={pwLoading}>
                  {pwLoading ? 'Actualizando...' : '🔒 Actualizar contraseña'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
