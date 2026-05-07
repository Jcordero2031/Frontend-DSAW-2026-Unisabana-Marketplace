import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthMobile.css';

const LoginMobile = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.endsWith('@unisabana.edu.co')) {
      setError('Solo se permiten correos @unisabana.edu.co');
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Correo o contraseña incorrectos');
    }
    setLoading(false);
  };

  return (
    <div className="auth-mobile">
      <div className="am-header">
        <div className="am-logo">🎓</div>
        <h1 className="am-title">Sabana Market</h1>
        <p className="am-subtitle">Inicia sesión con tu correo institucional</p>
      </div>

      <div className="am-card">
        <div className="am-tabs">
          <span className="am-tab active">Iniciar sesión</span>
          <Link to="/register" className="am-tab">Registrarse</Link>
        </div>

        {error && <div className="am-error">{error}</div>}

        <form onSubmit={handleSubmit} className="am-form" noValidate>
          <div className="am-field">
            <label className="am-label">Correo institucional</label>
            <input
              type="email"
              className="am-input"
              placeholder="tu.nombre@unisabana.edu.co"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="am-field">
            <label className="am-label">Contraseña</label>
            <div className="am-pw-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                className="am-input"
                placeholder="Tu contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" className="am-pw-toggle" onClick={() => setShowPw(v => !v)}>
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" className="am-submit" disabled={loading}>
            {loading ? 'Verificando...' : 'Iniciar sesión →'}
          </button>
        </form>

        <p className="am-switch">
          ¿No tienes cuenta?{' '}
          <Link to="/register">Regístrate aquí</Link>
        </p>
      </div>

      <div style={{ height: 80 }} />
    </div>
  );
};

export default LoginMobile;
