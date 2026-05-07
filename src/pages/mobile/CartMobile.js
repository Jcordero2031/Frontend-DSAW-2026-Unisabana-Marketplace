import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './CartMobile.css';

const formatPrice = (p) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p);

const CartMobile = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const loadCart = useCallback(async () => {
    if (!isAuthenticated) { setLoading(false); return; }
    try {
      const res = await cartService.get();
      setItems(res.data.items || []);
    } catch {}
    setLoading(false);
  }, [isAuthenticated]);

  useEffect(() => { loadCart(); }, [loadCart]);

  const updateQty = async (itemId, qty) => {
    if (qty < 1) return;
    setUpdating(itemId);
    try {
      await cartService.update(itemId, { quantity: qty });
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: qty } : i));
    } catch {}
    setUpdating(null);
  };

  const removeItem = async (itemId) => {
    setUpdating(itemId);
    try {
      await cartService.remove(itemId);
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch {}
    setUpdating(null);
  };

  const total = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);

  if (loading) return <div className="flex-center" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;

  if (!isAuthenticated) return (
    <div className="cart-mobile">
      <div className="cm-header"><h1 className="cm-title">Mi Carrito</h1></div>
      <div className="cm-empty">
        <div className="cm-empty-icon">🛒</div>
        <p>Inicia sesión para ver tu carrito</p>
        <button className="cm-login-btn" onClick={() => navigate('/login')}>Iniciar sesión</button>
      </div>
    </div>
  );

  if (items.length === 0) return (
    <div className="cart-mobile">
      <div className="cm-header"><h1 className="cm-title">Mi Carrito</h1></div>
      <div className="cm-empty">
        <div className="cm-empty-icon">🛒</div>
        <p>Tu carrito está vacío</p>
        <button className="cm-login-btn" onClick={() => navigate('/')}>Explorar productos</button>
      </div>
    </div>
  );

  return (
    <div className="cart-mobile">
      <div className="cm-header">
        <h1 className="cm-title">Mi Carrito</h1>
        <span className="cm-count">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
      </div>

      <div className="cm-list">
        {items.map(item => {
          const product = item.product || {};
          const busy = updating === item.id;
          return (
            <div key={item.id} className="cm-item">
              <div className="cm-item-img">
                {product.image
                  ? <img src={product.image} alt={product.name} />
                  : <span className="cm-emoji">{product.emoji || '📦'}</span>
                }
              </div>
              <div className="cm-item-info">
                <div className="cm-item-name">{product.name || product.title}</div>
                <div className="cm-item-price">{formatPrice(product.price)}</div>
                <div className="cm-item-controls">
                  <div className="cm-qty">
                    <button onClick={() => updateQty(item.id, item.quantity - 1)} disabled={busy || item.quantity <= 1}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)} disabled={busy || item.quantity >= (product.stock || 99)}>+</button>
                  </div>
                  <button className="cm-remove" onClick={() => removeItem(item.id)} disabled={busy}>🗑️</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="cm-summary">
        <div className="cm-summary-row">
          <span>Subtotal</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="cm-summary-row cm-total">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <div className="cm-action">
        <button className="cm-checkout-btn" onClick={() => navigate('/checkout')}>
          Proceder al pago →
        </button>
        <button className="cm-continue-btn" onClick={() => navigate('/')}>
          Seguir comprando
        </button>
      </div>

      <div style={{ height: 90 }} />
    </div>
  );
};

export default CartMobile;
