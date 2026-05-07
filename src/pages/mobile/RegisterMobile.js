import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthMobile.css';

const CAREERS = [
  'Administración de Empresas', 'Comunicación Social', 'Derecho', 'Diseño Gráfico',
  'Enfermería', 'Ingeniería de Sistemas', 'Ingeniería Industrial', 'Lenguas Modernas',
  'Medicina', 'Psicología', 'Química Farmacéutica',
];

const RegisterMobile = () => {
  const [form, setForm] = useState({ name: '', email: '', career: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.name.length < 3) { setError('Nombre muy corto (mínimo 3 caracteres)'); return; }
    if (!form.email.endsWith('@unisabana.edu.co')) { setError('Solo correos @unisabana.edu.co'); return; }
    if (!form.career) { setError('Selecciona tu carrera'); return; }
    if (form.password.length < 6) { setError('Contraseña mínimo 6 caracteres'); return; }
    if (form.password !== form.confirm) { setError('Las contraseñas no coinciden'); return; }
    if (!terms) { setError('Debes aceptar el reglamento'); return; }

    setLoading(true);
    const result = await register(form.name, form.email, form.password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Error al crear la cuenta');
    }
    setLoading(false);
  };

  return (
    <div className="auth-mobile">
      <div className="am-header">
        <div className="am-logo">🎓</div>
        <h1 className="am-title">Sabana Market</h1>
        <p className="am-subtitle">Crea tu cuenta con correo institucional</p>
      </div>

      <div className="am-card">
        <div className="am-tabs">
          <Link to="/login" className="am-tab">Iniciar sesión</Link>
          <span className="am-tab active">Registrarse</span>
        </div>

        {error && <div className="am-error">{error}</div>}

        <form onSubmit={handleSubmit} className="am-form" noValidate>
          <div className="am-field">
            <label className="am-label">Nombre completo</label>
            <input type="text" className="am-input" placeholder="Tu nombre completo" value={form.name} onChange={set('name')} required />
          </div>
          <div className="am-field">
            <label className="am-label">Correo institucional</label>
            <input type="email" className="am-input" placeholder="tu.nombre@unisabana.edu.co" value={form.email} onChange={set('email')} required />
          </div>
          <div className="am-field">
            <label className="am-label">Carrera</label>
            <select className="am-input am-select" value={form.career} onChange={set('career')}>
              <option value="">Selecciona tu carrera</option>
              {CAREERS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="am-field">
            <label className="am-label">Contraseña</label>
            <div className="am-pw-wrap">
              <input type={showPw ? 'text' : 'password'} className="am-input" placeholder="Mínimo 6 caracteres" value={form.password} onChange={set('password')} required />
              <button type="button" className="am-pw-toggle" onClick={() => setShowPw(v => !v)}>{showPw ? '🙈' : '👁️'}</button>
            </div>
          </div>
          <div className="am-field">
            <label className="am-label">Confirmar contraseña</label>
            <input type={showPw ? 'text' : 'password'} className="am-input" placeholder="Repite tu contraseña" value={form.confirm} onChange={set('confirm')} required />
          </div>

          <label className="am-terms">
            <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} />
            <span>Acepto el reglamento de Sabana Market y las políticas institucionales</span>
          </label>

          <button type="submit" className="am-submit" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta →'}
          </button>
        </form>

        <p className="am-switch">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login">Inicia sesión</Link>
        </p>
      </div>

      <div style={{ height: 80 }} />
    </div>
  );
};

export default RegisterMobile;
