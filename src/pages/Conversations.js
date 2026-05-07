import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { conversationService } from '../services/api';
import './Conversations.css';

const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'ahora';
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
};

const Conversations = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    conversationService.getAll()
      .then(res => setConversations(res.data.conversations || res.data || []))
      .catch(() => setError('No se pudieron cargar las conversaciones'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex-center" style={{ minHeight: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div className="conv-page">
      <div className="container">
        <div className="conv-header">
          <h1 className="conv-title">Mensajes</h1>
          <span className="conv-subtitle">{conversations.length} conversaci{conversations.length === 1 ? 'ón' : 'ones'}</span>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {conversations.length === 0 && !error ? (
          <div className="conv-empty">
            <div className="conv-empty-icon">💬</div>
            <h3>Sin conversaciones</h3>
            <p>Cuando contactes a un vendedor o recibas mensajes, aparecerán aquí.</p>
            <button className="btn btn-primary" onClick={() => navigate('/listing')}>
              Explorar productos
            </button>
          </div>
        ) : (
          <div className="conv-list">
            {conversations.map(conv => (
              <div
                key={conv.conversationId || conv.id}
                className="conv-item"
                onClick={() => navigate(`/conversations/${conv.conversationId || conv.id}`)}
              >
                <div className="conv-avatar">
                  {(conv.otherUser || conv.otherUserName || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="conv-info">
                  <div className="conv-item-header">
                    <span className="conv-username">{conv.otherUser || conv.otherUserName || 'Usuario'}</span>
                    <span className="conv-time">{conv.lastMessageAt ? timeAgo(conv.lastMessageAt) : ''}</span>
                  </div>
                  {conv.productTitle && (
                    <div className="conv-product">📦 {conv.productTitle}</div>
                  )}
                  <div className="conv-last-msg">{conv.lastMessage || 'Sin mensajes aún'}</div>
                </div>
                <div className="conv-arrow">›</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversations;
