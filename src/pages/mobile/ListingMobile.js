import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { productService } from '../../services/api';
import './ListingMobile.css';

const CATEGORIES = [
  { id: 'todos', name: 'Todos', emoji: '🏷️' },
  { id: 'libros', name: 'Libros', emoji: '📚' },
  { id: 'tutorias', name: 'Tutorías', emoji: '🎓' },
  { id: 'laboratorio', name: 'Lab', emoji: '🧪' },
  { id: 'diseno', name: 'Diseño', emoji: '✏️' },
  { id: 'servicios', name: 'Servicios', emoji: '🔧' },
];

const formatPrice = (p) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p);

const ListingMobile = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('cat') || 'todos');
  const [sort, setSort] = useState('relevancia');
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState(500000);

  useEffect(() => {
    productService.getAll()
      .then(res => setProducts(res.data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useCallback(() => {
    let list = [...products];
    const q = search.trim().toLowerCase();
    if (category !== 'todos') list = list.filter(p => p.category === category);
    if (q) list = list.filter(p =>
      (p.name || p.title || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    );
    list = list.filter(p => p.price <= maxPrice);
    if (sort === 'precio-asc') list.sort((a, b) => a.price - b.price);
    if (sort === 'precio-desc') list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, search, category, maxPrice, sort]);

  const results = filtered();

  return (
    <div className="listing-mobile">

      {/* Search bar */}
      <div className="lm-topbar">
        <div className="lm-search-wrap">
          <span className="lm-search-icon">🔍</span>
          <input
            type="text"
            className="lm-search-input"
            placeholder="Buscar productos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="lm-clear-btn" onClick={() => setSearch('')}>✕</button>
          )}
        </div>
        <button className="lm-filter-btn" onClick={() => setShowFilters(s => !s)}>
          ⚙️
        </button>
      </div>

      {/* Category chips */}
      <div className="lm-chips-wrap">
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            className={`lm-chip${category === c.id ? ' active' : ''}`}
            onClick={() => setCategory(c.id)}
          >
            {c.emoji} {c.name}
          </button>
        ))}
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="lm-filters-panel">
          <div className="lm-filter-row">
            <span className="lm-filter-label">Ordenar por</span>
            <select
              className="lm-filter-select"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="relevancia">Relevancia</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
            </select>
          </div>
          <div className="lm-filter-row">
            <span className="lm-filter-label">Precio máximo: <strong>{formatPrice(maxPrice)}</strong></span>
            <input
              type="range"
              min="0" max="500000" step="10000"
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--blue-dark)' }}
            />
          </div>
          <button className="lm-reset-btn" onClick={() => { setSort('relevancia'); setMaxPrice(500000); setCategory('todos'); setSearch(''); setShowFilters(false); }}>
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Results count */}
      <div className="lm-count">{results.length} resultado{results.length !== 1 ? 's' : ''}</div>

      {/* Grid */}
      {loading ? (
        <div className="lm-loading"><div className="spinner" /></div>
      ) : results.length > 0 ? (
        <div className="lm-grid">
          {results.map(p => (
            <div key={p.id} className="lm-card" onClick={() => navigate(`/product/${p.id}`)}>
              <div className="lm-card-img">
                {p.image
                  ? <img src={p.image} alt={p.name} />
                  : <span>{p.emoji || '📦'}</span>
                }
              </div>
              <div className="lm-card-body">
                <div className="lm-card-name">{p.name || p.title}</div>
                {p.seller?.name && <div className="lm-card-seller">{p.seller.name}</div>}
                <div className="lm-card-price">{formatPrice(p.price)}</div>
                <span className={`lm-badge ${p.estado === 'nuevo' || p.condition === 'new' ? 'nuevo' : 'usado'}`}>
                  {p.estado === 'nuevo' || p.condition === 'new' ? 'Nuevo' : 'Usado'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="lm-empty">
          <span>🔎</span>
          <p>{search ? `Sin resultados para "${search}"` : 'Sin productos con estos filtros'}</p>
          <button onClick={() => { setSearch(''); setCategory('todos'); }} className="btn btn-primary btn-sm">
            Limpiar filtros
          </button>
        </div>
      )}

      <div style={{ height: 80 }} />
    </div>
  );
};

export default ListingMobile;
