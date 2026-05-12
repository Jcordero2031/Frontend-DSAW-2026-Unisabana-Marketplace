import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/api';
import './MyOrders.css';

const formatPrice = (p) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p);

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });

const STATUS_LABELS = {
  pending:   { label: 'Pendiente',  color: '#C9A84C', bg: '#FFF8E7' },
  delivered: { label: 'Entregado',  color: '#2C5FA8', bg: '#EEF4FF' },
  completed: { label: 'Completado', color: '#1A7A3A', bg: '#EEF9F0' },
  cancelled: { label: 'Cancelado',  color: '#C0392B', bg: '#FFF0F0' },
  // legacy Spanish keys (just in case)
  pendiente: { label: 'Pendiente',  color: '#C9A84C', bg: '#FFF8E7' },
  entregado: { label: 'Entregado',  color: '#2C5FA8', bg: '#EEF4FF' },
  completado:{ label: 'Completado', color: '#1A7A3A', bg: '#EEF9F0' },
  cancelado: { label: 'Cancelado',  color: '#C0392B', bg: '#FFF0F0' },
};

const OrderCard = ({ order, onCancel, onConfirmReceipt }) => {
  const navigate = useNavigate();
  const status = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
  const canCancel = order.status === 'pending' || order.status === 'pendiente';
  // Show confirm receipt button when delivered and buyer hasn't confirmed yet
  const canConfirm = (order.status === 'delivered' || order.status === 'entregado')
    && !order.buyerConfirmedReceipt;

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
              onClick={() => item.productId && navigate(`/product/${item.productId}`)}
            >
              <span>📦</span>
            </div>
            <div className="order-item-info">
              <div className="order-item-name">{item.productName || item.product?.name || 'Producto'}</div>
              <div className="order-item-qty">Cantidad: {item.quantity}</div>
            </div>
            <div className="order-item-price">{formatPrice((item.priceAtPurchase || item.product?.price || 0) * item.quantity)}</div>
          </div>
        ))}
      </div>

      {order.seller && (
        <div style={{ padding: '0 16px 8px', fontSize: 13, color: '#666' }}>
          Vendedor: <strong>{order.seller.name}</strong>
        </div>
      )}

      <div className="order-card-footer">
        <div className="order-total">
          Total: <strong>{formatPrice(order.total || order.totalAmount || 0)}</strong>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {canConfirm && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onConfirmReceipt(order.id)}
              title="Confirma que recibiste tu pedido"
            >
              ✅ Confirmar recepción
            </button>
          )}
          {order.buyerConfirmedReceipt && order.status !== 'completed' && (
            <span style={{ fontSize: 12, color: '#1A7A3A', alignSelf: 'center' }}>
              ✔ Recepción confirmada
            </span>
          )}
          {canCancel && (
            <button className="btn btn-secondary btn-sm" onClick={() => onCancel(order.id)}>
              Cancelar orden
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    orderService.getMyOrders()
      .then(res => setOrders(res.data.purchases || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (orderId) => {
    if (!window.confirm('¿Cancelar esta orden?')) return;
    setActionId(orderId);
    try {
      await orderService.cancel(orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo cancelar');
    }
    setActionId(null);
  };

  const handleConfirmReceipt = async (orderId) => {
    if (!window.confirm('¿Confirmar que recibiste este pedido?')) return;
    setActionId(orderId);
    try {
      const res = await orderService.confirmReceipt(orderId);
      const updated = res.data.order;
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o));
      alert(res.data.message || 'Recepción confirmada.');
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo confirmar la recepción');
    }
    setActionId(null);
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
                onCancel={actionId ? () => {} : handleCancel}
                onConfirmReceipt={actionId ? () => {} : handleConfirmReceipt}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
