import React, { useState, useEffect } from 'react';
import { orderService } from '../services/api';
import './MyOrders.css';
import './MySales.css';

const formatPrice = (p) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p);

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d) ? '' : d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
};

// Claves en inglés (valores reales de la DB) + español como fallback
const STATUS_LABELS = {
  pending:   { label: 'Pendiente',  color: '#C9A84C', bg: '#FFF8E7' },
  delivered: { label: 'Entregado',  color: '#2C5FA8', bg: '#EEF4FF' },
  completed: { label: 'Completado', color: '#1A7A3A', bg: '#EEF9F0' },
  cancelled: { label: 'Cancelado',  color: '#C0392B', bg: '#FFF0F0' },
  // fallback español
  pendiente:  { label: 'Pendiente',  color: '#C9A84C', bg: '#FFF8E7' },
  entregado:  { label: 'Entregado',  color: '#2C5FA8', bg: '#EEF4FF' },
  completado: { label: 'Completado', color: '#1A7A3A', bg: '#EEF9F0' },
  cancelado:  { label: 'Cancelado',  color: '#C0392B', bg: '#FFF0F0' },
};

const FILTERS = [
  { key: 'all',       label: 'Todas' },
  { key: 'pending',   label: 'Pendientes' },
  { key: 'delivered', label: 'Entregadas' },
  { key: 'completed', label: 'Completadas' },
  { key: 'cancelled', label: 'Canceladas' },
];

const MySales = () => {
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [actionId, setActionId]   = useState(null);
  const [filter, setFilter]       = useState('all');

  useEffect(() => {
    orderService.getMyOrders()
      .then(res => {
        // Backend retorna { purchases, sales }
        setOrders(res.data.sales || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markDelivered = async (orderId) => {
    if (!window.confirm('¿Marcar esta orden como entregada?')) return;
    setActionId(orderId);
    try {
      await orderService.deliver(orderId);
      setOrders(prev =>
        prev.map(o => o.id === orderId
          ? { ...o, status: 'delivered', sellerConfirmedPayment: true }
          : o
        )
      );
    } catch (err) {
      alert(err.response?.data?.error || 'Error al marcar como entregada');
    }
    setActionId(null);
  };

  const filtered = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  if (loading) return (
    <div className="flex-center" style={{ minHeight: '60vh' }}><div className="spinner" /></div>
  );

  return (
    <div className="orders-page">
      <div className="container">
        <h1 className="orders-title">Mis Ventas</h1>
        <p className="orders-sub">
          {orders.length} venta{orders.length !== 1 ? 's' : ''} registrada{orders.length !== 1 ? 's' : ''}
        </p>

        {/* Filtros */}
        <div className="sales-filters">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`btn btn-sm ${filter === f.key ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">📦</div>
            <h3>{filter === 'all' ? 'Sin ventas aún' : `Sin órdenes ${STATUS_LABELS[filter]?.label?.toLowerCase()}`}</h3>
            <p>Cuando vendas un producto aparecerá aquí.</p>
          </div>
        ) : (
          <div className="orders-list">
            {filtered.map(order => {
              const status = STATUS_LABELS[order.status] || STATUS_LABELS.pending;

              // Solo puede marcar entregada si está pendiente
              const canDeliver = order.status === 'pending' || order.status === 'pendiente';

              return (
                <div key={order.id} className="order-card">
                  <div className="order-card-header">
                    <div>
                      <div className="order-id">
                        Orden #{(order.id || '').slice(0, 8).toUpperCase()}
                      </div>
                      <div className="order-date">{formatDate(order.createdAt)}</div>
                      {order.buyer && (
                        <div className="sales-buyer">
                          👤 Comprador: <strong>{order.buyer.name || order.buyer.email}</strong>
                        </div>
                      )}
                    </div>
                    <span
                      className="order-status-badge"
                      style={{ color: status.color, background: status.bg }}
                    >
                      {status.label}
                    </span>
                  </div>

                  {/* Ítems — usan productName y priceAtPurchase (estructura real de la DB) */}
                  <div className="order-items">
                    {(order.items || []).map((item, i) => (
                      <div key={i} className="order-item-row">
                        <div className="order-item-img">
                          <span>📦</span>
                        </div>
                        <div className="order-item-info">
                          <div className="order-item-name">
                            {item.productName || item.product?.name || 'Producto'}
                          </div>
                          <div className="order-item-qty">Cantidad: {item.quantity}</div>
                        </div>
                        <div className="order-item-price">
                          {formatPrice((item.priceAtPurchase || item.product?.price || 0) * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-card-footer">
                    <div className="order-total">
                      Total: <strong>{formatPrice(order.total || 0)}</strong>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      {/* Botón principal: marcar como entregada */}
                      {canDeliver && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => markDelivered(order.id)}
                          disabled={actionId === order.id}
                        >
                          {actionId === order.id ? 'Marcando...' : '🚚 Marcar como entregada'}
                        </button>
                      )}

                      {/* Estado de confirmación del comprador */}
                      {(order.status === 'delivered' || order.status === 'completed') && (
                        <span style={{
                          fontSize: 12,
                          color: order.buyerConfirmedReceipt ? '#1A7A3A' : '#C9A84C',
                        }}>
                          {order.buyerConfirmedReceipt
                            ? '✅ Comprador confirmó recepción'
                            : '⏳ Esperando confirmación del comprador'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySales;
