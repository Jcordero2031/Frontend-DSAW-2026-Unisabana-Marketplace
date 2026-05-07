import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService, cartService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const response = await productService.getById(id);
      setProduct(response.data.product);
    } catch (error) {
      alert('Error al cargar el producto');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await cartService.add({ productId: product.id, quantity });
      alert('Producto agregado al carrito');
      navigate('/cart');
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  const isOwner = user?.id === product.sellerId;

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div className="product-detail-grid">
        <div className="product-detail-image">
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <div className="image-placeholder">📦</div>
          )}
        </div>

        <div className="product-detail-info">
          <h1>{product.name}</h1>
          <p className="product-detail-price">{formatPrice(product.price)}</p>
          
          <div className="product-detail-stock">
            {product.stock > 0 ? (
              <span className="badge-success">
                {product.stock} disponibles
              </span>
            ) : (
              <span className="badge-danger">Agotado</span>
            )}
          </div>

          <div className="product-detail-description">
            <h3>Descripción</h3>
            <p>{product.description}</p>
          </div>

          {product.seller && (
            <div className="product-detail-seller">
              <h3>Vendedor</h3>
              <p>{product.seller.name}</p>
              <p className="text-secondary">{product.seller.email}</p>
            </div>
          )}

          {!isOwner && product.stock > 0 && (
            <div className="product-detail-actions">
              <div className="quantity-selector">
                <label>Cantidad:</label>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="input"
                />
              </div>
              <button onClick={handleAddToCart} className="btn btn-primary btn-block">
                🛒 Agregar al carrito
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
