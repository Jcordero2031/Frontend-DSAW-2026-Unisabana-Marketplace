import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile';
import BecomeSeller from './pages/BecomeSeller';
import CreateProduct from './pages/CreateProduct';
import MyProducts from './pages/MyProducts';
import MySales from './pages/MySales';
import Conversations from './pages/Conversations';
import ConversationDetail from './pages/ConversationDetail';
import Notifications from './pages/Notifications';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Seller Protected Route
const SellerRoute = ({ children }) => {
  const { isSeller, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return isSeller() ? children : <Navigate to="/become-seller" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/product/:id" element={<ProductDetail />} />

            {/* Protected Routes */}
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/conversations"
              element={
                <ProtectedRoute>
                  <Conversations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/conversations/:id"
              element={
                <ProtectedRoute>
                  <ConversationDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/become-seller"
              element={
                <ProtectedRoute>
                  <BecomeSeller />
                </ProtectedRoute>
              }
            />

            {/* Seller Routes */}
            <Route
              path="/create-product"
              element={
                <ProtectedRoute>
                  <SellerRoute>
                    <CreateProduct />
                  </SellerRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-product/:id"
              element={
                <ProtectedRoute>
                  <SellerRoute>
                    <CreateProduct />
                  </SellerRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-products"
              element={
                <ProtectedRoute>
                  <SellerRoute>
                    <MyProducts />
                  </SellerRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-sales"
              element={
                <ProtectedRoute>
                  <SellerRoute>
                    <MySales />
                  </SellerRoute>
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
