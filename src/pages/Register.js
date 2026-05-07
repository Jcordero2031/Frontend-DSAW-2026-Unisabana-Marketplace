import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const CAREERS = [
  'Administración de Empresas', 'Comunicación Social', 'Derecho', 'Diseño Gráfico',
  'Enfermería', 'Ingeniería de Sistemas', 'Ingeniería Industrial', 'Lenguas Modernas',
  'Medicina', 'Psicología', 'Química Farmacéutica',
];

const AuthFeature = ({ icon, title, desc }) => (
  <div className="auth-feature">
    <span>{icon}</span>
    <div>
      <strong>{title}</strong>
      <p>{desc}</p>
    </div>
  </div>
);

const Register = () => {
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

    if (form.name.length < 3) { setError('Ingresa tu nombre completo (mínimo 3 caracteres)'); return; }
    if (!form.email.endsWith('@unisabana.edu.co')) { setError('Solo se permiten correos @unisabana.edu.co'); return; }
    if (!form.career) { setError('Selecciona tu carrera'); return; }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    if (form.password !== form.confirm) { setError('Las contraseñas no coinciden'); return; }
    if (!terms) { setError('Debes aceptar el reglamento para continuar'); return; }

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
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
          <h2>Sabana Market</h2>
          <p>La comunidad de compra y venta exclusiva para estudiantes de la Universidad de La Sabana</p>
        </div>
        <div className="auth-features">
          <AuthFeature icon="📚" title="Libros y materiales" desc="Encuentra todo lo que necesitas para tu semestre" />
          <AuthFeature icon="🎓" title="Tutorías especializadas" desc="Aprende de otros estudiantes en tu carrera" />
          <AuthFeature icon="🔒" title="100% seguro" desc="Solo estudiantes verificados con correo institucional" />
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-tabs-row">
            <Link to="/login" className="auth-tab">Iniciar sesión</Link>
            <span className="auth-tab active">Registrarse</span>
          </div>

          <div className="auth-form-header">
            <h3>Crear cuenta</h3>
            <p>Únete a la comunidad Sabana Market</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label className="form-label">Nombre completo</label>
              <input type="text" className="input" placeholder="Tu nombre completo" value={form.name} onChange={set('name')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Correo institucional</label>
              <input type="email" className="input" placeholder="tu.nombre@unisabana.edu.co" value={form.email} onChange={set('email')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Carrera</label>
              <select className="input" value={form.career} onChange={set('career')}>
                <option value="">Selecciona tu carrera</option>
                {CAREERS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <div className="pw-wrap">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input"
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={set('password')}
                  required
                />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirmar contraseña</label>
              <div className="pw-wrap">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input"
                  placeholder="Repite tu contraseña"
                  value={form.confirm}
                  onChange={set('confirm')}
                  required
                />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 13, color: 'var(--text)' }}>
                <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} style={{ marginTop: 2, accentColor: 'var(--blue-dark)' }} />
                Acepto el reglamento de Sabana Market y las políticas institucionales
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--muted)' }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color: 'var(--blue-mid)', fontWeight: 600 }}>Inicia sesión</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
