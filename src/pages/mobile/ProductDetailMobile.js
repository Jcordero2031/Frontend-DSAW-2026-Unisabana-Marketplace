import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService, cartService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './ProductDetailMobile.css';

const formatPrice = (p) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p);

const ProductDetailMobile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    productService.getById(id)
      .then(res => setProduct(res.data.product))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setAdding(true);
    try {
      await cartService.add({ productId: product.id, quantity });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {}
    setAdding(false);
  };

  if (loading) return <div className="flex-center" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;
  if (!product) return null;

  const isOwner = user?.id === product.sellerId;
  const inStock = product.stock > 0;

  return (
    <div className="pdm-container">
      {/* Back button */}
      <button className="pdm-back" onClick={() => navigate(-1)}>← Volver</button>

      {/* Image */}
      <div className="pdm-image">
        {product.image
          ? <img src={product.image} alt={product.name} />
          : <span className="pdm-emoji">{product.emoji || '📦'}</span>
        }
      </div>

      {/* Info */}
      <div className="pdm-info">
        <div className="pdm-badges">
          <span className={`badge ${product.estado === 'nuevo' || product.condition === 'new' ? 'badge-nuevo' : 'badge-usado'}`}>
            {product.estado === 'nuevo' || product.condition === 'new' ? 'Nuevo' : 'Usado'}
          </span>
          {product.category && (
            <span className="badge badge-popular" style={{ background: '#f4f6fb', color: 'var(--muted)' }}>
              {product.category}
            </span>
          )}
        </div>

        <h1 className="pdm-title">{product.name || product.title}</h1>
        <div className="pdm-price">{formatPrice(product.price)}</div>

        {product.seller && (
          <div className="pdm-seller">
            <span className="pdm-seller-avatar">👤</span>
            <div>
              <div className="pdm-seller-name">{product.seller.name}</div>
              <div className="pdm-seller-email">{product.seller.email}</div>
            </div>
          </div>
        )}

        <div className="pdm-desc-section">
          <h3>Descripción</h3>
          <p>{product.description}</p>
        </div>

        <div className="pdm-stock">
          {inStock
            ? <span style={{ color: 'var(--success)' }}>✅ {product.stock} disponible{product.stock !== 1 ? 's' : ''}</span>
            : <span style={{ color: 'var(--error)' }}>❌ Agotado</span>
          }
        </div>
      </div>

      {/* Fixed bottom action */}
      {!isOwner && inStock && (
        <div className="pdm-action-bar">
          <div className="pdm-qty">
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>+</button>
          </div>
          <button
            className={`pdm-cart-btn${added ? ' success' : ''}`}
            onClick={handleAddToCart}
            disabled={adding}
          >
            {added ? '✅ Agregado' : adding ? 'Agregando...' : '🛒 Agregar al carrito'}
          </button>
        </div>
      )}

      <div style={{ height: 90 }} />
    </div>
  );
};

export default ProductDetailMobile;
