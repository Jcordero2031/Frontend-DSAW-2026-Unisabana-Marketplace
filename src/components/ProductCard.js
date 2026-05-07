import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cartService } from '../services/api';
import './ProductCard.css';

const ProductCard = ({ product, onDelete, showActions = false }) => {
  const { isAuthenticated, user } = useAuth();
  const isOwner = user?.id === product.sellerId;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para agregar al carrito');
      return;
    }

    try {
      await cartService.add({ productId: product.id, quantity: 1 });
      alert('Producto agregado al carrito');
    } catch (error) {
      alert(error.response?.data?.error || 'Error al agregar al carrito');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-image-link">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="product-image"
          />
        ) : (
          <div className="product-image-placeholder">
            📦
          </div>
        )}
      </Link>

      <div className="product-info">
        <Link to={`/product/${product.id}`} className="product-name">
          {product.name}
        </Link>

        <p className="product-description">
          {product.description.substring(0, 80)}
          {product.description.length > 80 && '...'}
        </p>

        <div className="product-footer">
          <span className="product-price">{formatPrice(product.price)}</span>
          
          {product.stock > 0 ? (
            <span className="product-stock">
              {product.stock} {product.stock === 1 ? 'disponible' : 'disponibles'}
            </span>
          ) : (
            <span className="product-stock out-of-stock">
              Agotado
            </span>
          )}
        </div>

        {product.seller && (
          <div className="product-seller">
            <span className="seller-label">Vendedor:</span>
            <span className="seller-name">{product.seller.name}</span>
          </div>
        )}

        <div className="product-actions">
          {!isOwner && product.stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="btn btn-primary btn-sm"
            >
              🛒 Agregar al carrito
            </button>
          )}

          {showActions && isOwner && (
            <>
              <Link
                to={`/edit-product/${product.id}`}
                className="btn btn-secondary btn-sm"
              >
                ✏️ Editar
              </Link>
              {onDelete && (
                <button
                  onClick={() => onDelete(product.id)}
                  className="btn btn-danger btn-sm"
                >
                  🗑️ Eliminar
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
