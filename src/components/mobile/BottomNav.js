import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './BottomNav.css';

const BottomNav = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const active = (path) => location.pathname === path;

  return (
    <nav className="bottom-nav">
      <Link to="/" className={`bottom-nav-item${active('/') ? ' active' : ''}`}>
        <span className="bottom-nav-icon">🏠</span>
        <span className="bottom-nav-label">Inicio</span>
      </Link>

      <Link to="/listing" className={`bottom-nav-item${active('/listing') ? ' active' : ''}`}>
        <span className="bottom-nav-icon">🔍</span>
        <span className="bottom-nav-label">Explorar</span>
      </Link>

      {isAuthenticated ? (
        <>
          <Link to="/cart" className={`bottom-nav-item${active('/cart') ? ' active' : ''}`}>
            <span className="bottom-nav-icon">🛒</span>
            <span className="bottom-nav-label">Carrito</span>
          </Link>
          <Link to="/profile" className={`bottom-nav-item${active('/profile') ? ' active' : ''}`}>
            <span className="bottom-nav-icon">👤</span>
            <span className="bottom-nav-label">Perfil</span>
          </Link>
        </>
      ) : (
        <Link to="/login" className={`bottom-nav-item${active('/login') ? ' active' : ''}`}>
          <span className="bottom-nav-icon">👤</span>
          <span className="bottom-nav-label">Ingresar</span>
        </Link>
      )}
    </nav>
  );
};

export default BottomNav;
