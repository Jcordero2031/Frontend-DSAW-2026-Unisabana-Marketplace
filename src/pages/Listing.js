import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/api';
import ProductCard from '../components/ProductCard';
import './Listing.css';

const CATEGORIES = [
  { id: 'todos', name: 'Todas las categorías' },
  { id: 'libros', name: '📚 Libros' },
  { id: 'tutorias', name: '🎓 Tutorías' },
  { id: 'laboratorio', name: '🧪 Laboratorio' },
  { id: 'diseno', name: '✏️ Diseño' },
  { id: 'servicios', name: '🔧 Servicios' },
];

const SORT_OPTIONS = [
  { value: 'relevancia', label: 'Relevancia' },
  { value: 'precio-asc', label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
  { value: 'reciente', label: 'Más reciente' },
];

const PER_PAGE = 9;

const Listing = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('cat') || 'todos');
  const [sort, setSort] = useState('relevancia');
  const [maxPrice, setMaxPrice] = useState(500000);
  const [soloStock, setSoloStock] = useState(false);
  const [estados, setEstados] = useState({ nuevo: false, usado: false });
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getAll();
      setProducts(res.data.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useCallback(() => {
    let list = [...products];
    const q = search.trim().toLowerCase();

    if (category !== 'todos') list = list.filter(p => p.category === category);
    if (q) list = list.filter(p =>
      (p.name || p.title || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    );
    if (estados.nuevo || estados.usado) {
      list = list.filter(p => {
        const isNew = p.estado === 'nuevo' || p.condition === 'new';
        return (estados.nuevo && isNew) || (estados.usado && !isNew);
      });
    }
    list = list.filter(p => p.price <= maxPrice);
    if (soloStock) list = list.filter(p => p.stock > 0);

    switch (sort) {
      case 'precio-asc': list.sort((a, b) => a.price - b.price); break;
      case 'precio-desc': list.sort((a, b) => b.price - a.price); break;
      case 'reciente': list.sort((a, b) => b.id - a.id); break;
      default: break;
    }
    return list;
  }, [products, search, category, estados, maxPrice, soloStock, sort]);

  const results = filtered();
  const totalPages = Math.ceil(results.length / PER_PAGE);
  const paginated = results.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const clearFilters = () => {
    setSearch('');
    setCategory('todos');
    setSort('relevancia');
    setMaxPrice(500000);
    setSoloStock(false);
    setEstados({ nuevo: false, usado: false });
    setPage(1);
    setSearchParams({});
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const formatPrice = (p) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p);

  const activeTags = [
    category !== 'todos' && { label: CATEGORIES.find(c => c.id === category)?.name, clear: () => setCategory('todos') },
    search && { label: `"${search}"`, clear: () => setSearch('') },
    estados.nuevo && { label: 'Nuevo', clear: () => setEstados(s => ({ ...s, nuevo: false })) },
    estados.usado && { label: 'Usado', clear: () => setEstados(s => ({ ...s, usado: false })) },
    maxPrice < 500000 && { label: `Hasta ${formatPrice(maxPrice)}`, clear: () => setMaxPrice(500000) },
  ].filter(Boolean);

  return (
    <div className="listing-layout container">
      {/* Sidebar */}
      <aside className="filters-sidebar">
        <div className="filters-header">
          <h3>Filtros</h3>
          <button className="btn btn-sm" style={{ background: 'none', color: 'var(--muted)' }} onClick={clearFilters}>
            Limpiar todo
          </button>
        </div>

        <div className="filter-group">
          <div className="filter-title">Categoría</div>
          {CATEGORIES.map(c => (
            <label key={c.id} className="filter-check">
              <input
                type="radio"
                name="cat"
                value={c.id}
                checked={category === c.id}
                onChange={() => { setCategory(c.id); setPage(1); }}
              />
              {c.name}
            </label>
          ))}
        </div>

        <div className="filter-group">
          <div className="filter-title">Estado</div>
          <label className="filter-check">
            <input type="checkbox" checked={estados.nuevo} onChange={e => setEstados(s => ({ ...s, nuevo: e.target.checked }))} />
            Nuevo
          </label>
          <label className="filter-check">
            <input type="checkbox" checked={estados.usado} onChange={e => setEstados(s => ({ ...s, usado: e.target.checked }))} />
            Usado
          </label>
        </div>

        <div className="filter-group">
          <div className="filter-title">Precio máximo</div>
          <div className="price-range-labels">
            <span>$0</span>
            <span>{formatPrice(maxPrice)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="500000"
            step="10000"
            value={maxPrice}
            className="price-slider"
            onChange={e => setMaxPrice(Number(e.target.value))}
          />
        </div>

        <div className="filter-group" style={{ borderBottom: 'none', marginBottom: 0 }}>
          <div className="filter-title">Disponibilidad</div>
          <label className="filter-check">
            <input type="checkbox" checked={soloStock} onChange={e => setSoloStock(e.target.checked)} />
            Solo con stock
          </label>
        </div>
      </aside>

      {/* Main */}
      <main className="listing-main">
        <div className="listing-topbar">
          <form className="listing-search-wrap" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="listing-search-input"
              placeholder="Buscar productos..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
            <span className="listing-search-icon">🔍</span>
          </form>
          <div className="listing-controls">
            <span className="results-count">{results.length} resultado{results.length !== 1 ? 's' : ''}</span>
            <select
              className="input"
              style={{ width: 'auto', padding: '8px 12px', fontSize: 13 }}
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Active filter tags */}
        {activeTags.length > 0 && (
          <div className="active-tags">
            {activeTags.map((t, i) => (
              <span key={i} className="active-tag">
                {t.label}
                <button onClick={t.clear}>×</button>
              </span>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex-center" style={{ padding: '48px 0' }}>
            <div className="spinner" />
          </div>
        ) : paginated.length > 0 ? (
          <div className="grid-3">
            {paginated.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <div className="empty-state-icon">🔎</div>
            <h3>{search ? `No encontramos resultados para "${search}"` : 'Sin productos con estos filtros'}</h3>
            <p>Intenta con otras palabras clave o ajusta los filtros</p>
            <button className="btn btn-primary" onClick={clearFilters}>Limpiar filtros</button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                className={`page-btn${n === page ? ' active' : ''}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Listing;
