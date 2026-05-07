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
  const { becomeSeller, isSeller } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isSeller()) {
    return (
      <div className="become-page">
        <div className="container become-wrap">
          <div className="become-already">
            <div className="become-already-icon">🏪</div>
            <h2>¡Ya eres vendedor!</h2>
            <p>Tu cuenta ya tiene permisos de vendedor activos.</p>
            <div className="become-already-actions">
              <button className="btn btn-primary" onClick={() => navigate('/create-product')}>
                + Publicar producto
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/my-products')}>
                Ver mis productos
              </button>
            </div>
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
      navigate('/create-product');
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
