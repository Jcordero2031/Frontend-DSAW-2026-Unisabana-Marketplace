import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import useIsMobile from './hooks/useIsMobile';

// Desktop components
import Navbar from './components/Navbar';

// Desktop Pages
import Home from './pages/Home';
import Listing from './pages/Listing';
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
import Admin from './pages/Admin';

// Mobile components
import NavbarMobile from './components/mobile/NavbarMobile';
import BottomNav from './components/mobile/BottomNav';

// Mobile Pages
import HomeMobile from './pages/mobile/HomeMobile';
import ListingMobile from './pages/mobile/ListingMobile';
import LoginMobile from './pages/mobile/LoginMobile';
import RegisterMobile from './pages/mobile/RegisterMobile';
import ProductDetailMobile from './pages/mobile/ProductDetailMobile';
import CartMobile from './pages/mobile/CartMobile';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex-center" style={{ minHeight: '100vh' }}><div className="spinner" /></div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const SellerRoute = ({ children }) => {
  const { isSeller, loading } = useAuth();
  if (loading) return <div className="flex-center" style={{ minHeight: '100vh' }}><div className="spinner" /></div>;
  return isSeller() ? children : <Navigate to="/become-seller" />;
};

// Role-based authorization middleware (Ticket 18)
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex-center" style={{ minHeight: '100vh' }}><div className="spinner" /></div>;
  const isAdmin = user?.roles?.includes('admin') || user?.role === 'admin';
  return isAdmin ? children : <Navigate to="/" />;
};

function AppRoutes() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="App">
        <NavbarMobile />
        <Routes>
          <Route path="/" element={<HomeMobile />} />
          <Route path="/listing" element={<ListingMobile />} />
          <Route path="/login" element={<LoginMobile />} />
          <Route path="/register" element={<RegisterMobile />} />
          <Route path="/product/:id" element={<ProductDetailMobile />} />
          <Route path="/cart" element={<ProtectedRoute><CartMobile /></ProtectedRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/conversations" element={<ProtectedRoute><Conversations /></ProtectedRoute>} />
          <Route path="/conversations/:id" element={<ProtectedRoute><ConversationDetail /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/become-seller" element={<ProtectedRoute><BecomeSeller /></ProtectedRoute>} />
          <Route path="/create-product" element={<ProtectedRoute><SellerRoute><CreateProduct /></SellerRoute></ProtectedRoute>} />
          <Route path="/edit-product/:id" element={<ProtectedRoute><SellerRoute><CreateProduct /></SellerRoute></ProtectedRoute>} />
          <Route path="/my-products" element={<ProtectedRoute><SellerRoute><MyProducts /></SellerRoute></ProtectedRoute>} />
          <Route path="/my-sales" element={<ProtectedRoute><SellerRoute><MySales /></SellerRoute></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminRoute><Admin /></AdminRoute></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listing" element={<Listing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/conversations" element={<ProtectedRoute><Conversations /></ProtectedRoute>} />
        <Route path="/conversations/:id" element={<ProtectedRoute><ConversationDetail /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/become-seller" element={<ProtectedRoute><BecomeSeller /></ProtectedRoute>} />
        <Route path="/create-product" element={<ProtectedRoute><SellerRoute><CreateProduct /></SellerRoute></ProtectedRoute>} />
        <Route path="/edit-product/:id" element={<ProtectedRoute><SellerRoute><CreateProduct /></SellerRoute></ProtectedRoute>} />
        <Route path="/my-products" element={<ProtectedRoute><SellerRoute><MyProducts /></SellerRoute></ProtectedRoute>} />
        <Route path="/my-sales" element={<ProtectedRoute><SellerRoute><MySales /></SellerRoute></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminRoute><Admin /></AdminRoute></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
