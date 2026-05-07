import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService, cartService, reviewService, reportService, conversationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

const formatPrice = (price) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);

const Stars = ({ rating }) => {
  const full = Math.round(rating || 0);
  return (
    <span className="pd-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= full ? '#C9A84C' : '#ddd' }}>★</span>
      ))}
    </span>
  );
};

const ReportModal = ({ target, targetId, onClose }) => {
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setSending(true);
    try {
      await reportService.create({ targetType: target, targetId, reason: reason.trim() });
      setDone(true);
    } catch {}
    setSending(false);
  };

  return (
    <div className="pd-modal-overlay" onClick={onClose}>
      <div className="pd-modal" onClick={e => e.stopPropagation()}>
        <div className="pd-modal-header">
          <h3>Reportar {target === 'product' ? 'producto' : 'usuario'}</h3>
          <button className="pd-modal-close" onClick={onClose}>✕</button>
        </div>
        {done ? (
          <div className="pd-modal-success">
            <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
            <p>Reporte enviado. Lo revisaremos pronto.</p>
            <button className="btn btn-primary" onClick={onClose}>Cerrar</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <label className="pd-modal-label">Motivo del reporte</label>
            <textarea
              className="input"
              placeholder="Describe el problema (contenido inapropiado, fraude, spam...)"
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={4}
              maxLength={500}
              required
            />
            <div className="pd-modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-danger" disabled={sending || !reason.trim()}>
                {sending ? 'Enviando...' : 'Enviar reporte'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsMeta, setReviewsMeta] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadProduct = async () => {
    try {
      const res = await productService.getById(id);
      const p = res.data.product;
      setProduct(p);
      if (p.sellerId) {
        reviewService.getBySeller(p.sellerId)
          .then(r => {
            setReviews(r.data.reviews || []);
            setReviewsMeta({
              averageRating: r.data.averageRating || 0,
              totalReviews: r.data.totalReviews || 0,
            });
          })
          .catch(() => {});
      }
    } catch {
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      await cartService.add({ productId: product.id, quantity });
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al agregar al carrito');
    }
  };

  const handleContact = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setContacting(true);
    try {
      const res = await conversationService.create({ productId: product.id, sellerId: product.sellerId });
      const convId = res.data.conversationId || res.data.conversation?.id || res.data.id;
      navigate(`/conversations/${convId}`);
    } catch {
      navigate('/conversations');
    }
    setContacting(false);
  };

  if (loading) return <div className="flex-center" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;
  if (!product) return null;

  const isOwner = user?.id === product.sellerId;
  const inStock = product.stock > 0;

  return (
    <div className="container pd-page">
      <div className="pd-breadcrumb">
        <span onClick={() => navigate('/')} className="pd-link">Inicio</span> ›{' '}
        <span onClick={() => navigate('/listing')} className="pd-link">Productos</span> ›{' '}
        <span>{product.name || product.title}</span>
      </div>

      <div className="pd-grid">
        {/* Image */}
        <div className="pd-image-col">
          <div className="pd-image">
            {product.image
              ? <img src={product.image} alt={product.name} />
              : <span className="pd-emoji">{product.emoji || '📦'}</span>
            }
          </div>
          <div className="pd-badges">
            <span className={`badge ${product.estado === 'nuevo' || product.condition === 'new' ? 'badge-nuevo' : 'badge-usado'}`}>
              {product.estado === 'nuevo' || product.condition === 'new' ? 'Nuevo' : 'Usado'}
            </span>
            {product.category && (
              <span className="badge" style={{ background: '#f4f6fb', color: 'var(--muted)' }}>{product.category}</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="pd-info-col">
          <h1 className="pd-title">{product.name || product.title}</h1>
          <div className="pd-price">{formatPrice(product.price)}</div>

          <div className="pd-stock">
            {inStock
              ? <span className="badge badge-nuevo">✅ {product.stock} disponible{product.stock !== 1 ? 's' : ''}</span>
              : <span className="badge badge-usado">❌ Agotado</span>
            }
          </div>

          <div className="pd-desc">
            <h3>Descripción</h3>
            <p>{product.description}</p>
          </div>

          {product.seller && (
            <div className="pd-seller">
              <div className="pd-seller-avatar">👤</div>
              <div>
                <div className="pd-seller-name">{product.seller.name}</div>
                <div className="pd-seller-email">{product.seller.email}</div>
                {reviewsMeta.totalReviews > 0 && (
                  <div className="pd-seller-rating">
                    <Stars rating={reviewsMeta.averageRating} />
                    <span>{reviewsMeta.averageRating.toFixed(1)} ({reviewsMeta.totalReviews} reseña{reviewsMeta.totalReviews !== 1 ? 's' : ''})</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {!isOwner && inStock && (
            <div className="pd-actions">
              <div className="pd-qty">
                <label>Cantidad</label>
                <div className="pd-qty-ctrl">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>+</button>
                </div>
              </div>
              <button
                className={`btn btn-primary btn-block ${addedToCart ? 'btn-success' : ''}`}
                onClick={handleAddToCart}
              >
                {addedToCart ? '✅ Agregado al carrito' : '🛒 Agregar al carrito'}
              </button>
              {product.sellerId && (
                <button
                  className="btn btn-secondary btn-block"
                  onClick={handleContact}
                  disabled={contacting}
                >
                  {contacting ? 'Abriendo chat...' : '💬 Contactar vendedor'}
                </button>
              )}
            </div>
          )}

          {isOwner && (
            <div className="pd-owner-actions">
              <button className="btn btn-secondary" onClick={() => navigate(`/edit-product/${product.id}`)}>
                ✏️ Editar producto
              </button>
            </div>
          )}

          {!isOwner && (
            <button className="pd-report-link" onClick={() => setShowReport(true)}>
              🚩 Reportar este producto
            </button>
          )}
        </div>
      </div>

      {/* Reviews section */}
      {reviews.length > 0 && (
        <div className="pd-reviews">
          <div className="pd-reviews-header">
            <h2>Reseñas del vendedor</h2>
            <div className="pd-reviews-avg">
              <Stars rating={reviewsMeta.averageRating} />
              <span className="pd-avg-num">{reviewsMeta.averageRating.toFixed(1)}</span>
              <span className="pd-avg-total">({reviewsMeta.totalReviews} reseñas)</span>
            </div>
          </div>
          <div className="pd-reviews-grid">
            {reviews.map(r => (
              <div key={r.reviewId || r.id} className="pd-review-card">
                <div className="pd-review-top">
                  <div className="pd-review-avatar">{(r.buyerName || 'U').charAt(0)}</div>
                  <div>
                    <div className="pd-review-name">{r.buyerName || 'Comprador'}</div>
                    <Stars rating={r.rating} />
                  </div>
                  <span className="pd-review-rating">{r.rating}/5</span>
                </div>
                {r.comment && <p className="pd-review-comment">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {showReport && (
        <ReportModal
          target="product"
          targetId={product.id}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
};

export default ProductDetail;
