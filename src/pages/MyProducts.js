import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/api';
import './MyProducts.css';

const formatPrice = (p) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p);

const MyProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    productService.getMyProducts()
      .then(res => setProducts(res.data.products || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (productId) => {
    if (!window.confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return;
    setDeletingId(productId);
    try {
      await productService.delete(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar');
    }
    setDeletingId(null);
  };

  const filtered = products.filter(p =>
    (p.name || p.title || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex-center" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;

  return (
    <div className="myprod-page">
      <div className="container">
        <div className="myprod-header">
          <div>
            <h1 className="myprod-title">Mis Productos</h1>
            <p className="myprod-sub">{products.length} producto{products.length !== 1 ? 's' : ''} publicado{products.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/create-product')}>
            + Publicar producto
          </button>
        </div>

        {products.length === 0 ? (
          <div className="myprod-empty">
            <div className="myprod-empty-icon">📦</div>
            <h3>Sin productos aún</h3>
            <p>Publica tu primer artículo y empieza a vender en Sabana Market.</p>
            <button className="btn btn-primary" onClick={() => navigate('/create-product')}>
              Publicar ahora
            </button>
          </div>
        ) : (
          <>
            <div className="myprod-search">
              <input
                className="input"
                placeholder="🔍 Buscar mis productos..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="myprod-grid">
              {filtered.map(p => (
                <div key={p.id} className="myprod-card">
                  <div className="myprod-img">
                    {p.image
                      ? <img src={p.image} alt={p.name} />
                      : <span className="myprod-emoji">{p.emoji || '📦'}</span>
                    }
                    <span className={`myprod-status ${p.stock === 0 ? 'status-out' : 'status-active'}`}>
                      {p.stock === 0 ? 'Agotado' : 'Activo'}
                    </span>
                  </div>
                  <div className="myprod-info">
                    <h3 className="myprod-name">{p.name || p.title}</h3>
                    <div className="myprod-meta">
                      <span className="myprod-price">{formatPrice(p.price)}</span>
                      <span className="myprod-stock">{p.stock} und.</span>
                    </div>
                    {p.category && <span className="badge" style={{ background: '#f4f6fb', color: 'var(--muted)', fontSize: 11 }}>{p.category}</span>}
                  </div>
                  <div className="myprod-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(`/edit-product/${p.id}`)}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                    >
                      {deletingId === p.id ? '...' : '🗑️'}
                    </button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <p style={{ color: 'var(--muted)', gridColumn: '1/-1' }}>Sin resultados para "{search}"</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyProducts;
