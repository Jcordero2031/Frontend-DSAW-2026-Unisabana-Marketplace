import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService, orderService } from '../services/api';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const response = await cartService.get();
      setCart(response.data.cart);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await cartService.remove(itemId);
      loadCart();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  const handleCheckout = async () => {
    if (window.confirm('¿Confirmar la compra?')) {
      try {
        await orderService.create();
        alert('¡Compra realizada!');
        navigate('/my-orders');
      } catch (error) {
        alert(error.response?.data?.error || 'Error al procesar');
      }
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="container" style={{padding: '2rem'}}>
      <h1>Mi Carrito</h1>
      {cart?.items?.length > 0 ? (
        <>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem'}}>
            {cart.items.map(item => (
              <div key={item.id} className="card" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <h3>{item.product?.name}</h3>
                  <p>Cantidad: {item.quantity}</p>
                  <p>${item.product?.price}</p>
                </div>
                <button onClick={() => handleRemove(item.id)} className="btn btn-danger">Eliminar</button>
              </div>
            ))}
          </div>
          <div className="card" style={{marginTop: '2rem'}}>
            <h2>Total: ${total}</h2>
            <button onClick={handleCheckout} className="btn btn-primary">Finalizar Compra</button>
          </div>
        </>
      ) : (
        <p style={{textAlign: 'center', marginTop: '3rem'}}>Tu carrito está vacío</p>
      )}
    </div>
  );
};

export default Cart;
