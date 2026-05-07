import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/api';
import './Notifications.css';

const TYPE_ICONS = {
  nuevo_mensaje: '💬',
  nueva_orden: '🛒',
  orden_entregada: '✅',
  orden_cancelada: '❌',
  nueva_resena: '⭐',
  nuevo_reporte: '🚨',
};

const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'ahora';
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    notificationService.getAll()
      .then(res => setNotifications(res.data.notifications || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (notifId) => {
    try {
      await notificationService.markAsRead(notifId);
      setNotifications(prev =>
        prev.map(n => (n.notificationId || n.id) === notifId ? { ...n, read: true } : n)
      );
    } catch {}
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
    setMarkingAll(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) return <div className="flex-center" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;

  return (
    <div className="notif-page">
      <div className="container">
        <div className="notif-header">
          <div>
            <h1 className="notif-title">Notificaciones</h1>
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount} sin leer</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              className="btn btn-secondary"
              onClick={markAllRead}
              disabled={markingAll}
            >
              {markingAll ? 'Marcando...' : '✓ Marcar todas como leídas'}
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="notif-empty">
            <div className="notif-empty-icon">🔔</div>
            <h3>Sin notificaciones</h3>
            <p>Aquí aparecerán tus mensajes, órdenes y novedades.</p>
          </div>
        ) : (
          <div className="notif-list">
            {notifications.map(notif => {
              const nid = notif.notificationId || notif.id;
              const icon = TYPE_ICONS[notif.type] || '🔔';
              return (
                <div
                  key={nid}
                  className={`notif-item ${notif.read ? '' : 'unread'}`}
                  onClick={() => !notif.read && markRead(nid)}
                >
                  <div className="notif-icon">{icon}</div>
                  <div className="notif-content">
                    <p className="notif-msg">{notif.message}</p>
                    <span className="notif-time">{timeAgo(notif.createdAt)}</span>
                  </div>
                  {!notif.read && <div className="notif-dot" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
