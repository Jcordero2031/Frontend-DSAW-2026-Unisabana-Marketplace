import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productService } from '../../services/api';
import './HomeMobile.css';

const CATEGORIES = [
  { id: 'libros', name: 'Libros', emoji: '📚', color: '#EEF4FF' },
  { id: 'tutorias', name: 'Tutorías', emoji: '🎓', color: '#F0FFF4' },
  { id: 'laboratorio', name: 'Lab', emoji: '🧪', color: '#FFFBEE' },
  { id: 'diseno', name: 'Diseño', emoji: '✏️', color: '#FFF0F5' },
  { id: 'servicios', name: 'Servicios', emoji: '🔧', color: '#F5F0FF' },
];

const formatPrice = (p) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p);

const HomeMobile = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    productService.getAll({ limit: 6 })
      .then(res => setProducts(res.data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const goSearch = () => {
    if (search.trim()) navigate(`/listing?q=${encodeURIComponent(search.trim())}`);
    else navigate('/listing');
  };

  return (
    <div className="home-mobile">

      {/* Hero */}
      <section className="hm-hero">
        <div className="hm-hero-eyebrow">Marketplace Institucional</div>
        <h1 className="hm-hero-title">Compra y vende en <em>La Sabana</em></h1>
        <p className="hm-hero-desc">Solo con correo @unisabana.edu.co</p>
        <div className="hm-search-wrap">
          <input
            type="text"
            className="hm-search-input"
            placeholder="¿Qué estás buscando?"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && goSearch()}
          />
          <button className="hm-search-btn" onClick={goSearch}>🔍</button>
        </div>
        <div className="hm-hero-tags">
          {['Cálculo', 'Tutorías', 'Lab', 'Diseño'].map(t => (
            <span key={t} onClick={() => navigate(`/listing?q=${t.toLowerCase()}`)}>{t}</span>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="hm-section">
        <div className="hm-section-header">
          <h2 className="hm-section-title">Categorías</h2>
        </div>
        <div className="hm-categories">
          {CATEGORIES.map(c => (
            <div
              key={c.id}
              className="hm-cat-card"
              style={{ background: c.color }}
              onClick={() => navigate(`/listing?cat=${c.id}`)}
            >
              <span className="hm-cat-icon">{c.emoji}</span>
              <span className="hm-cat-name">{c.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="hm-section">
        <div className="hm-section-header">
          <h2 className="hm-section-title">Destacados</h2>
          <Link to="/listing" className="hm-see-all">Ver todos →</Link>
        </div>

        {loading ? (
          <div className="hm-loading"><div className="spinner" /></div>
        ) : products.length > 0 ? (
          <div className="hm-products-grid">
            {products.map(p => (
              <div
                key={p.id}
                className="hm-product-card"
                onClick={() => navigate(`/product/${p.id}`)}
              >
                <div className="hm-product-img">
                  {p.image
                    ? <img src={p.image} alt={p.name} />
                    : <span>{p.emoji || '📦'}</span>
                  }
                </div>
                <div className="hm-product-info">
                  <div className="hm-product-name">{p.name || p.title}</div>
                  <div className="hm-product-price">{formatPrice(p.price)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="hm-empty">
            <span>📦</span>
            <p>Sin productos aún</p>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="hm-cta">
        <h2>¿Tienes algo que vender?</h2>
        <p>Publica gratis y llega a más de 1.300 estudiantes</p>
        <Link to="/create-product" className="hm-cta-btn">✨ Publicar ahora</Link>
      </section>

      {/* Spacer para bottom nav */}
      <div style={{ height: 80 }} />
    </div>
  );
};

export default HomeMobile;
