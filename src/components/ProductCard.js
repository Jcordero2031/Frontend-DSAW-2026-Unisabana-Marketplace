import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cartService } from '../services/api';
import './ProductCard.css';

const formatPrice = (price) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);

const BADGE_CLASS = { Nuevo: 'badge-nuevo', Popular: 'badge-popular', Oferta: 'badge-oferta' };

const ProductCard = ({ product, onDelete, showActions = false }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const isOwner = user?.id === product.sellerId;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await cartService.add({ productId: product.id, quantity: 1 });
    } catch {}
  };

  const badge = product.badge;
  const outOfStock = product.stock === 0;
  const isNew = product.estado === 'nuevo' || product.condition === 'new';
  const categoryName = product.category;

  return (
    <div
      className="product-card card"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div
        className="product-card-img"
        style={{ background: product.bg || product.image ? undefined : '#EEF4FF' }}
      >
        {badge && <span className={`badge ${BADGE_CLASS[badge] || 'badge-popular'} product-badge-top-left`}>{badge}</span>}
        {outOfStock && <span className="badge badge-agotado product-badge-top-right">Agotado</span>}
        {product.image ? (
          <img src={product.image} alt={product.name || product.title} className="product-img" />
        ) : (
          <span className="product-emoji">{product.emoji || '📦'}</span>
        )}
      </div>

      <div className="product-card-body">
        <div className="product-card-meta">
          <span className={`badge ${isNew ? 'badge-nuevo' : 'badge-usado'}`}>
            {isNew ? 'Nuevo' : 'Usado'}
          </span>
          {categoryName && (
            <span className="badge badge-popular" style={{ background: '#f4f6fb', color: 'var(--muted)' }}>
              {categoryName}
            </span>
          )}
        </div>

        <div className="product-card-title">{product.name || product.title}</div>

        <div className="product-card-prices">
          <span className="product-card-price">{formatPrice(product.price)}</span>
          {product.priceOld && (
            <span className="product-card-price-old">{formatPrice(product.priceOld)}</span>
          )}
        </div>

        {product.seller?.name && (
          <div className="product-card-seller">{product.seller.name}</div>
        )}

        <div className="product-card-footer">
          <div className="product-card-stock">
            {outOfStock ? (
              <span style={{ color: 'var(--error)', fontSize: 12 }}>Sin stock</span>
            ) : (
              <span style={{ color: 'var(--success)', fontSize: 12 }}>{product.stock} disponible{product.stock !== 1 ? 's' : ''}</span>
            )}
          </div>

          {!showActions ? (
            <button
              className="add-cart-btn"
              onClick={handleAddToCart}
              disabled={outOfStock}
            >
              {outOfStock ? 'Agotado' : '+ Carrito'}
            </button>
          ) : (
            isOwner && (
              <div className="product-actions" onClick={e => e.stopPropagation()}>
                <Link to={`/edit-product/${product.id}`} className="btn btn-secondary btn-sm">✏️ Editar</Link>
                {onDelete && (
                  <button onClick={() => onDelete(product.id)} className="btn btn-danger btn-sm">🗑️</button>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
