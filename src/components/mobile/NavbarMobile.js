import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './NavbarMobile.css';

const NavbarMobile = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/listing?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar-mobile">
        <Link to="/" className="nm-logo">
          <span className="nm-logo-icon">🎓</span>
          <span className="nm-logo-text">Sabana Market</span>
        </Link>

        <div className="nm-actions">
          <button className="nm-icon-btn" onClick={() => setSearchOpen(s => !s)}>🔍</button>
          <button className="nm-icon-btn" onClick={() => setMenuOpen(s => !s)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Search bar desplegable */}
      {searchOpen && (
        <form className="nm-search-bar" onSubmit={handleSearch}>
          <input
            autoFocus
            type="text"
            className="nm-search-input"
            placeholder="Buscar productos..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button type="submit" className="nm-search-submit">Buscar</button>
        </form>
      )}

      {/* Menú lateral */}
      {menuOpen && (
        <>
          <div className="nm-overlay" onClick={() => setMenuOpen(false)} />
          <div className="nm-drawer">
            <div className="nm-drawer-header">
              <span className="nm-logo-text">Sabana Market</span>
              <button className="nm-icon-btn" onClick={() => setMenuOpen(false)}>✕</button>
            </div>
            <div className="nm-drawer-links">
              <Link to="/" className="nm-drawer-link" onClick={() => setMenuOpen(false)}>🏠 Inicio</Link>
              <Link to="/listing" className="nm-drawer-link" onClick={() => setMenuOpen(false)}>🔍 Explorar</Link>
              <Link to="/listing?cat=libros" className="nm-drawer-link" onClick={() => setMenuOpen(false)}>📚 Libros</Link>
              <Link to="/listing?cat=tutorias" className="nm-drawer-link" onClick={() => setMenuOpen(false)}>🎓 Tutorías</Link>
              {isAuthenticated ? (
                <>
                  <div className="nm-drawer-divider" />
                  <Link to="/cart" className="nm-drawer-link" onClick={() => setMenuOpen(false)}>🛒 Carrito</Link>
                  <Link to="/my-orders" className="nm-drawer-link" onClick={() => setMenuOpen(false)}>📦 Mis compras</Link>
                  <Link to="/profile" className="nm-drawer-link" onClick={() => setMenuOpen(false)}>👤 Mi perfil</Link>
                  <Link to="/conversations" className="nm-drawer-link" onClick={() => setMenuOpen(false)}>💬 Mensajes</Link>
                  <div className="nm-drawer-divider" />
                  <button className="nm-drawer-link danger" onClick={handleLogout}>🚪 Cerrar sesión</button>
                </>
              ) : (
                <>
                  <div className="nm-drawer-divider" />
                  <Link to="/login" className="nm-drawer-link" onClick={() => setMenuOpen(false)}>Iniciar sesión</Link>
                  <Link to="/register" className="nm-drawer-btn" onClick={() => setMenuOpen(false)}>Registrarse</Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default NavbarMobile;
