import React, { useState, useEffect } from 'react';
import { orderService } from '../services/api';
import './MyOrders.css';
import './MySales.css';

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

const MySales = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deliveringId, setDeliveringId] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // GET /orders/my-orders returns orders where the user is the seller
    orderService.getMyOrders()
      .then(res => {
        const all = res.data.orders || res.data.sales || res.data || [];
        setOrders(all);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markDelivered = async (orderId) => {
    if (!window.confirm('¿Marcar esta orden como entregada?')) return;
    setDeliveringId(orderId);
    try {
      await orderService.deliver(orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'entregado' } : o));
    } catch (err) {
      alert(err.response?.data?.error || 'Error al marcar como entregada');
    }
    setDeliveringId(null);
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (loading) return <div className="flex-center" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;

  return (
    <div className="orders-page">
      <div className="container">
        <h1 className="orders-title">Mis Ventas</h1>
        <p className="orders-sub">{orders.length} venta{orders.length !== 1 ? 's' : ''} registrada{orders.length !== 1 ? 's' : ''}</p>

        <div className="sales-filters">
          {['all', 'pendiente', 'en_proceso', 'entregado', 'cancelado'].map(f => (
            <button
              key={f}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Todas' : STATUS_LABELS[f]?.label}
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
              const status = STATUS_LABELS[order.status] || STATUS_LABELS.pendiente;
              const canDeliver = order.status === 'pendiente' || order.status === 'en_proceso';
              return (
                <div key={order.id} className="order-card">
                  <div className="order-card-header">
                    <div>
                      <div className="order-id">Orden #{(order.id || '').slice(0, 8).toUpperCase()}</div>
                      <div className="order-date">{formatDate(order.createdAt)}</div>
                      {order.buyer && (
                        <div className="sales-buyer">
                          👤 Comprador: <strong>{order.buyer.name || order.buyer.email}</strong>
                        </div>
                      )}
                    </div>
                    <span className="order-status-badge" style={{ color: status.color, background: status.bg }}>
                      {status.label}
                    </span>
                  </div>

                  <div className="order-items">
                    {(order.items || order.orderItems || []).map((item, i) => (
                      <div key={i} className="order-item-row">
                        <div className="order-item-img">
                          {item.product?.image
                            ? <img src={item.product.image} alt={item.product.name} />
                            : <span>{item.product?.emoji || '📦'}</span>
                          }
                        </div>
                        <div className="order-item-info">
                          <div className="order-item-name">{item.product?.name || 'Producto'}</div>
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
                    {canDeliver && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => markDelivered(order.id)}
                        disabled={deliveringId === order.id}
                      >
                        {deliveringId === order.id ? 'Marcando...' : '✅ Marcar como entregada'}
                      </button>
                    )}
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
