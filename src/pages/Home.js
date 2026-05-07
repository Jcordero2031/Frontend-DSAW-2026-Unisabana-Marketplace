import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productService } from '../services/api';
import ProductCard from '../components/ProductCard';
import './Home.css';

const CATEGORIES = [
  { id: 'libros', name: 'Libros', emoji: '📚', color: '#EEF4FF', count: 47 },
  { id: 'tutorias', name: 'Tutorías', emoji: '🎓', color: '#F0FFF4', count: 23 },
  { id: 'laboratorio', name: 'Laboratorio', emoji: '🧪', color: '#FFFBEE', count: 15 },
  { id: 'diseno', name: 'Diseño', emoji: '✏️', color: '#FFF0F5', count: 19 },
  { id: 'servicios', name: 'Servicios', emoji: '🔧', color: '#F5F0FF', count: 31 },
];

const STATS = [
  { target: 247, label: 'Productos activos' },
  { target: 1340, label: 'Estudiantes registrados' },
  { target: 98, label: '% satisfacción' },
];

function useCountUp(target, active) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let current = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setValue(current);
      if (current >= target) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [target, active]);
  return value;
}

function StatCard({ target, label, animate }) {
  const value = useCountUp(target, animate);
  return (
    <div className="stat-card">
      <div className="stat-num">{value.toLocaleString('es-CO')}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>Sabana Market</h3>
            <p>El marketplace oficial de la comunidad estudiantil de la Universidad de La Sabana. Compra, vende y conecta con otros estudiantes.</p>
          </div>
          <div className="footer-col">
            <h4>Marketplace</h4>
            <Link to="/listing">Explorar</Link>
            <Link to="/listing?cat=libros">Libros</Link>
            <Link to="/listing?cat=tutorias">Tutorías</Link>
            <Link to="/create-product">Publicar</Link>
          </div>
          <div className="footer-col">
            <h4>Cuenta</h4>
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/register">Registrarse</Link>
            <Link to="/profile">Mi Perfil</Link>
            <Link to="/cart">Carrito</Link>
          </div>
          <div className="footer-col">
            <h4>Universidad</h4>
            <a href="#">Reglamento</a>
            <a href="#">Ayuda</a>
            <a href="#">Reportar problema</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2025 Sabana Market · Universidad de La Sabana · Chía, Colombia</span>
          <span style={{ color: 'var(--gold-light)' }}>Solo para correos @unisabana.edu.co</span>
        </div>
      </div>
    </footer>
  );
}

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [animateStats, setAnimateStats] = useState(false);
  const heroRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
    const timer = setTimeout(() => setAnimateStats(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getAll({ limit: 8 });
      setProducts(res.data.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const goSearch = (q) => {
    const query = q || search;
    navigate(`/listing${query ? `?q=${encodeURIComponent(query)}` : ''}`);
  };

  const featured = products.slice(0, 4);
  const services = products.filter(p =>
    p.category === 'servicios' || p.category === 'tutorias'
  ).slice(0, 3);

  return (
    <>
      {/* HERO */}
      <section className="hero-section" ref={heroRef}>
        <div className="container">
          <div className="hero-inner">
            <div className="hero-text">
              <div className="hero-eyebrow">Marketplace Institucional</div>
              <h1 className="hero-title">
                Compra y vende dentro<br />de <em>La Sabana</em>
              </h1>
              <p className="hero-desc">
                El espacio seguro de la comunidad estudiantil para intercambiar libros, tutorías, servicios y más — solo con correo @unisabana.edu.co
              </p>
              <div className="hero-search-wrap">
                <input
                  type="text"
                  className="hero-search-input"
                  placeholder="¿Qué estás buscando?"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && goSearch()}
                />
                <button className="btn btn-gold-solid hero-search-btn" onClick={() => goSearch()}>
                  Buscar
                </button>
              </div>
              <div className="hero-tags">
                {[['📘', 'Cálculo'], ['🎓', 'Tutorías'], ['🧪', 'Lab'], ['✏️', 'Diseño']].map(([icon, label]) => (
                  <span key={label} onClick={() => goSearch(label.toLowerCase())}>{icon} {label}</span>
                ))}
              </div>
            </div>
            <div className="hero-stats">
              {STATS.map(s => (
                <StatCard key={s.label} target={s.target} label={s.label} animate={animateStats} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Explorar por categoría</h2>
          <p className="section-sub">Todo lo que necesitas para tu semestre en un solo lugar</p>
          <div className="categories-grid">
            {CATEGORIES.map(c => (
              <div
                key={c.id}
                className="cat-card"
                style={{ background: c.color }}
                onClick={() => navigate(`/listing?cat=${c.id}`)}
              >
                <span className="cat-icon">{c.emoji}</span>
                <div className="cat-name">{c.name}</div>
                <div className="cat-count">{c.count} publicaciones</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section" style={{ background: '#fff', padding: '64px 0' }}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Productos destacados</h2>
              <p className="section-sub" style={{ marginBottom: 0 }}>Lo más reciente y popular de la comunidad</p>
            </div>
            <Link to="/listing" className="btn btn-secondary">Ver todos →</Link>
          </div>
          {loading ? (
            <div className="flex-center" style={{ padding: '48px 0' }}>
              <div className="spinner" />
            </div>
          ) : featured.length > 0 ? (
            <div className="grid-4">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h3>Sin productos aún</h3>
              <p>Sé el primero en publicar algo</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="section">
        <div className="container">
          <div className="cta-banner">
            <div className="cta-text">
              <h2>¿Tienes algo que vender o<br /><em>un servicio que ofrecer?</em></h2>
              <p>Publica gratis en menos de 2 minutos y llega a más de 1.300 estudiantes de La Sabana</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/create-product" className="btn btn-gold-solid btn-lg">✨ Publicar ahora</Link>
                <Link to="/listing" className="btn btn-lg" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)', background: 'transparent' }}>
                  Explorar mercado
                </Link>
              </div>
            </div>
            <div className="cta-illo">
              {['📚', '💰', '🎓', '⭐'].map((e, i) => (
                <div key={i} className={`cta-float f${i + 1}`}>{e}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      {services.length > 0 && (
        <section className="section" style={{ background: '#fff', padding: '64px 0' }}>
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">Servicios recientes</h2>
                <p className="section-sub" style={{ marginBottom: 0 }}>Estudiantes ofreciendo sus talentos</p>
              </div>
              <Link to="/listing?cat=servicios" className="btn btn-secondary">Ver servicios →</Link>
            </div>
            <div className="grid-3">
              {services.map(p => (
                <Link key={p.id} to={`/product/${p.id}`} className="service-card">
                  <div className="service-card-top">
                    <div className="service-card-icon">🔧</div>
                    <div>
                      <div className="service-card-title">{p.name}</div>
                      <div className="service-card-seller">{p.seller?.name}</div>
                    </div>
                  </div>
                  <div className="service-card-desc">{p.description}</div>
                  <div className="service-card-footer">
                    <div className="service-price">
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p.price)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
};

export default Home;
