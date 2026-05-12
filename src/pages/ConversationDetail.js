import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { conversationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ConversationDetail.css';

const formatTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d) ? '' : d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (iso) => {
  if (!iso) return 'Hoy';
  const d = new Date(iso);
  return isNaN(d) ? 'Hoy' : d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
};

const ConversationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conv, setConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  const loadMessages = useCallback(async () => {
    try {
      const convRes = await conversationService.getById(id);
      const convData = convRes.data.conversation || convRes.data;
      setConv(convData);
      // El backend incluye los mensajes dentro del objeto conversación
      // También intentamos el endpoint independiente como fallback
      const msgs = convData.messages
        ?? (await conversationService.getMessages(id).then(r => r.data.messages || []).catch(() => []));
      setMessages(msgs);
    } catch {
      setError('No se pudo cargar la conversación');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await conversationService.sendMessage(id, { content: text.trim() });
      // Backend responde { success, message: { id, senderId, content, createdAt, ... } }
      const newMsg = res.data.message && typeof res.data.message === 'object'
        ? res.data.message
        : res.data.data || res.data;
      setMessages(prev => [...prev, newMsg]);
      setText('');
    } catch {
      setError('Error al enviar el mensaje');
    }
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  if (loading) return <div className="flex-center" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;

  // El backend retorna buyer y seller como objetos { id, name }
  const otherUserObj = conv
    ? (conv.buyerId === user?.id ? conv.seller : conv.buyer)
    : null;
  const otherUser = otherUserObj?.name || conv?.otherUser?.name || conv?.otherUser || 'Usuario';
  const productTitle = conv?.product?.name || conv?.productTitle || '';

  let lastDate = null;

  return (
    <div className="cd-page">
      {/* Header */}
      <div className="cd-header">
        <button className="cd-back" onClick={() => navigate('/conversations')}>←</button>
        <div className="cd-avatar">{otherUser.charAt(0).toUpperCase()}</div>
        <div className="cd-header-info">
          <div className="cd-header-name">{otherUser}</div>
          {productTitle && <div className="cd-header-product">📦 {productTitle}</div>}
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ margin: '0 16px' }}>{error}</div>}

      {/* Messages */}
      <div className="cd-messages">
        {messages.length === 0 && (
          <div className="cd-empty">Sé el primero en enviar un mensaje</div>
        )}
        {messages.map((msg, idx) => {
          const senderId = msg.senderId || msg.sender?.id;
          const isMine = senderId === user?.id;
          const msgDate = formatDate(msg.sentAt || msg.createdAt);
          const showDate = msgDate !== lastDate;
          lastDate = msgDate;
          return (
            <React.Fragment key={msg.messageId || msg.id || idx}>
              {showDate && (
                <div className="cd-date-divider">{msgDate}</div>
              )}
              <div className={`cd-bubble-wrap ${isMine ? 'mine' : 'theirs'}`}>
                <div className={`cd-bubble ${isMine ? 'bubble-mine' : 'bubble-theirs'}`}>
                  <p>{msg.content}</p>
                  <span className="cd-time">{formatTime(msg.sentAt || msg.createdAt)}</span>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form className="cd-input-bar" onSubmit={handleSend}>
        <textarea
          className="cd-input"
          placeholder="Escribe un mensaje..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={1000}
        />
        <button type="submit" className="cd-send-btn" disabled={sending || !text.trim()}>
          {sending ? '...' : '➤'}
        </button>
      </form>
    </div>
  );
};

export default ConversationDetail;
