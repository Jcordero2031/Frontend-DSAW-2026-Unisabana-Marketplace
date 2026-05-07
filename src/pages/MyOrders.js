import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/api';
import './MyOrders.css';

const formatPrice = (p) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p);

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });

const STATUS_LABELS = {
  pendiente: { label: 'Pendiente', color: '#C9A84C', bg: '#FFF8E7' },
  en_proceso: { label: 'En proceso', color: '#2C5FA8', bg: '#EEF4FF' },
  entregado: { label: 'Entregado', color: '#1A7A3A', bg: '#EEF9F0' },
  cancelado: { label: 'Cancelado', color: '#C0392B', bg: '#FFF0F0' },
};

const OrderCard = ({ order, onCancel }) => {
  const navigate = useNavigate();
  const status = STATUS_LABELS[order.status] || STATUS_LABELS.pendiente;
  const canCancel = order.status === 'pendiente' || order.status === 'en_proceso';

  return (
    <div className="order-card">
      <div className="order-card-header">
        <div>
          <div className="order-id">Orden #{(order.id || '').slice(0, 8).toUpperCase()}</div>
          <div className="order-date">{formatDate(order.createdAt)}</div>
        </div>
        <span className="order-status-badge" style={{ color: status.color, background: status.bg }}>
          {status.label}
        </span>
      </div>

      <div className="order-items">
        {(order.items || order.orderItems || []).map((item, i) => (
          <div key={i} className="order-item-row">
            <div
              className="order-item-img"
              onClick={() => item.product?.id && navigate(`/product/${item.product.id}`)}
            >
              {item.product?.image
                ? <img src={item.product.image} alt={item.product.name} />
                : <span>{item.product?.emoji || '📦'}</span>
              }
            </div>
            <div className="order-item-info">
              <div className="order-item-name">{item.product?.name || item.product?.title || 'Producto'}</div>
              <div className="order-item-qty">Cantidad: {item.quantity}</div>
            </div>
            <div className="order-item-price">{formatPrice((item.product?.price || 0) * item.quantity)}</div>
          </div>
        ))}
      </div>

      <div className="order-card-footer">
        <div className="order-total">
          Total: <strong>{formatPrice(order.total || order.totalAmount || 0)}</strong>
        </div>
        {canCancel && (
          <button className="btn btn-secondary btn-sm" onClick={() => onCancel(order.id)}>
            Cancelar orden
          </button>
        )}
      </div>
    </div>
  );
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    orderService.getMyOrders()
      .then(res => setOrders(res.data.orders || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (orderId) => {
    if (!window.confirm('¿Cancelar esta orden?')) return;
    setCancellingId(orderId);
    try {
      await orderService.cancel(orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelado' } : o));
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo cancelar');
    }
    setCancellingId(null);
  };

  if (loading) return <div className="flex-center" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;

  return (
    <div className="orders-page">
      <div className="container">
        <h1 className="orders-title">Mis Compras</h1>
        <p className="orders-sub">{orders.length} orden{orders.length !== 1 ? 'es' : ''}</p>

        {orders.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">🛍️</div>
            <h3>Sin compras aún</h3>
            <p>Cuando realices una compra aparecerá aquí.</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onCancel={cancellingId ? () => {} : handleCancel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
