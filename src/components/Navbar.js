import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cartService, notificationService } from '../services/api';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated, isSeller } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadCartCount();
      loadNotificationCount();
    }
  }, [isAuthenticated]);

  const loadCartCount = async () => {
    try {
      const response = await cartService.get();
      const itemCount = response.data.cart.items.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(itemCount);
    } catch (error) {
      console.error('Error al cargar carrito:', error);
    }
  };

  const loadNotificationCount = async () => {
    try {
      const response = await notificationService.getAll();
      setNotificationCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">Unisabana</span>
          <span className="logo-accent">Marketplace</span>
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="navbar-link">
            Inicio
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/cart" className="navbar-link navbar-icon">
                🛒
                {cartCount > 0 && (
                  <span className="badge-count">{cartCount}</span>
                )}
              </Link>

              <Link to="/notifications" className="navbar-link navbar-icon">
                🔔
                {notificationCount > 0 && (
                  <span className="badge-count">{notificationCount}</span>
                )}
              </Link>

              <div className="navbar-user">
                <button
                  className="navbar-user-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="user-avatar">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="user-name">{user?.name}</span>
                  <span className="dropdown-arrow">▼</span>
                </button>

                {showUserMenu && (
                  <div className="user-dropdown">
                    <Link to="/profile" className="dropdown-item">
                      Mi Perfil
                    </Link>
                    <Link to="/my-orders" className="dropdown-item">
                      Mis Compras
                    </Link>
                    {isSeller() && (
                      <>
                        <Link to="/my-products" className="dropdown-item">
                          Mis Productos
                        </Link>
                        <Link to="/my-sales" className="dropdown-item">
                          Mis Ventas
                        </Link>
                      </>
                    )}
                    <Link to="/conversations" className="dropdown-item">
                      Mensajes
                    </Link>
                    <hr className="dropdown-divider" />
                    {!isSeller() && (
                      <Link to="/become-seller" className="dropdown-item">
                        Vender en Marketplace
                      </Link>
                    )}
                    <button onClick={handleLogout} className="dropdown-item logout">
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="btn btn-primary">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
