import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './BecomeSeller.css';

const BENEFITS = [
  { icon: '📦', title: 'Publica sin límite', desc: 'Crea tantos productos como quieras con fotos, precios y categorías.' },
  { icon: '💰', title: 'Gestiona tus ventas', desc: 'Panel de control para ver tus órdenes y marcarlas como entregadas.' },
  { icon: '💬', title: 'Chat con compradores', desc: 'Comunícate directamente con los interesados en tus artículos.' },
  { icon: '⭐', title: 'Gana reseñas', desc: 'Construye tu reputación en la comunidad universitaria.' },
];

const BecomeSeller = () => {
  const { becomeSeller, leaveSeller, isSeller, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activated, setActivated] = useState(false);
  const [deactivated, setDeactivated] = useState(false);

  const handleLeave = async () => {
    if (!window.confirm('¿Seguro que quieres dejar de ser vendedor? Perderás acceso a publicar productos.')) return;
    setLoading(true);
    setError('');
    const result = await leaveSeller();
    if (result.success) {
      setDeactivated(true);
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 4000);
    } else {
      setError(result.error || 'No se pudo quitar el rol de vendedor');
    }
    setLoading(false);
  };

  if (isSeller() && !activated) {
    return (
      <div className="become-page">
        <div className="container become-wrap">
          <div className="become-already">
            <div className="become-already-icon">🏪</div>
            <h2>¡Ya eres vendedor!</h2>
            <p>Tu cuenta ya tiene permisos de vendedor activos.</p>
            {error && <div className="alert alert-error">{error}</div>}
            {deactivated && (
              <div className="alert alert-success">
                ✅ Has dejado de ser vendedor. Debes iniciar sesión de nuevo para aplicar los cambios. Redirigiendo...
              </div>
            )}
            <div className="become-already-actions">
              <button className="btn btn-primary" onClick={() => navigate('/create-product')}>
                + Publicar producto
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/my-products')}>
                Ver mis productos
              </button>
            </div>
            {!deactivated && (
              <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                  ¿Ya no quieres vender en Sabana Market?
                </p>
                <button
                  className="btn btn-secondary"
                  onClick={handleLeave}
                  disabled={loading}
                  style={{ color: '#c0392b', borderColor: '#c0392b' }}
                >
                  {loading ? 'Procesando...' : '🚪 Dejar de ser vendedor'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleActivate = async () => {
    setLoading(true);
    setError('');
    const result = await becomeSeller();
    if (result.success) {
      setActivated(true);
      // El token JWT no se actualiza automáticamente — hay que volver a iniciar sesión
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 4000);
    } else {
      setError(result.error || 'No se pudo activar la cuenta de vendedor');
    }
    setLoading(false);
  };

  return (
    <div className="become-page">
      <div className="container become-wrap">
        <div className="become-hero">
          <h1 className="become-title">Conviértete en vendedor</h1>
          <p className="become-sub">
            Activa tu cuenta de vendedor y empieza a vender tus artículos a la comunidad universitaria de Unisabana.
          </p>
        </div>

        <div className="become-benefits">
          {BENEFITS.map(b => (
            <div key={b.title} className="become-benefit">
              <div className="become-benefit-icon">{b.icon}</div>
              <h3>{b.title}</h3>
              <p>{b.desc}</p>
            </div>
          ))}
        </div>

        <div className="become-cta">
          {error && <div className="alert alert-error">{error}</div>}
          {activated && (
            <div className="alert alert-success">
              ✅ ¡Cuenta de vendedor activada! Por seguridad debes iniciar sesión de nuevo para usar tus nuevos permisos. Redirigiendo al login en unos segundos...
            </div>
          )}
          <div className="become-terms">
            <p>Al activar tu cuenta de vendedor aceptas el reglamento de Sabana Market y te comprometes a describir tus productos honestamente y cumplir con las transacciones acordadas.</p>
          </div>
          <button
            className="btn btn-primary become-btn"
            onClick={handleActivate}
            disabled={loading}
          >
            {loading ? 'Activando cuenta...' : '🚀 Activar cuenta de vendedor'}
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default BecomeSeller;
