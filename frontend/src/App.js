import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [checkoutData, setCheckoutData] = useState({ name: '', email: '' });
  const [user, setUser] = useState({ name: 'Guest User', email: '' });

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, []);

  const fetchProducts = async () => {
    const res = await axios.get('http://localhost:5000/api/products');
    setProducts(res.data);
  };

  const fetchCart = async () => {
    const res = await axios.get('http://localhost:5000/api/cart');
    setCart(res.data.cartItems);
    setCartTotal(res.data.total);
  };

  const addToCart = async (productId) => {
    await axios.post('http://localhost:5000/api/cart', { productId, qty: 1 });
    fetchCart();
  };

  const removeFromCart = async (id) => {
    await axios.delete(`http://localhost:5000/api/cart/${id}`);
    fetchCart();
  };

  const updateQty = async (id, qty) => {
    if (qty < 1) return;
    await axios.delete(`http://localhost:5000/api/cart/${id}`);
    const item = cart.find(i => i._id === id);
    if (item) await axios.post('http://localhost:5000/api/cart', { productId: item.productId, qty });
    fetchCart();
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!checkoutData.name || !checkoutData.email) {
      alert('Please enter both Name and Email');
      return;
    }
    try {
      const payload = {
        cartItems: cart,
        customer: checkoutData
      };
      const res = await axios.post('http://localhost:5000/api/checkout', payload);
      setReceipt(res.data);
      setShowReceipt(true);
      setUser(checkoutData); // Set user profile to submitted checkout info
      setCheckoutData({ name: '', email: '' }); // Clear form
      fetchCart(); // Refresh cart (should be empty after checkout)
    } catch (error) {
      alert('Checkout failed. Please try again.');
      console.error(error);
    }
  };

  const handleLogout = () => {
    setUser({ name: 'Guest User', email: '' });
  };

  return (
    <div className="App">
      <header className="header">
        <h1>Vibe Commerce</h1>
        <div className="profile">
          <span className="profile-name">{user.name}</span>
          {user.email && <span className="profile-email">({user.email})</span>}
          {user.email && <button onClick={handleLogout} className="logout-btn">Logout</button>}
        </div>
      </header>

      <div className="container">
        <section className="products">
          <h2>Products</h2>
          <div className="product-grid">
            {products.map((p) => (
              <div key={p._id} className="product-card">
                <img src={p.image} alt={p.name} className="product-image" />
                <h3>{p.name}</h3>
                <p>${p.price.toFixed(2)}</p>
                <button className="add-btn" onClick={() => addToCart(p._id)}>Add to Cart</button>
              </div>
            ))}
          </div>
        </section>

        <section className="cart">
          <h2>Your Cart</h2>
          {cart.length === 0 ? (
            <p className="empty-cart">Your cart is empty.</p>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item._id} className="cart-item">
                  <span className="cart-item-name">{item.product.name}</span>
                  <span className="cart-item-price">${item.product.price.toFixed(2)}</span>
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => updateQty(item._id, parseInt(e.target.value, 10))}
                    className="qty-input"
                  />
                  <button onClick={() => removeFromCart(item._id)} className="remove-btn">Remove</button>
                </div>
              ))}
              <h3 className="cart-total">Total: ${cartTotal.toFixed(2)}</h3>
            </>
          )}

          {cart.length > 0 && (
            <form className="checkout-form" onSubmit={handleCheckout}>
              <h3>Checkout</h3>
              <input
                type="text"
                placeholder="Name"
                value={checkoutData.name}
                onChange={(e) => setCheckoutData({ ...checkoutData, name: e.target.value })}
                required
                className="checkout-input"
              />
              <input
                type="email"
                placeholder="Email"
                value={checkoutData.email}
                onChange={(e) => setCheckoutData({ ...checkoutData, email: e.target.value })}
                required
                className="checkout-input"
              />
              <button type="submit" className="submit-btn">Submit</button>
            </form>
          )}
        </section>
      </div>

      {showReceipt && receipt && (
        <div className="receipt-modal">
          <div className="receipt-content">
            <h2>Receipt</h2>
            <p><strong>Total:</strong> ${receipt.total.toFixed(2)}</p>
            <p><strong>Timestamp:</strong> {new Date(receipt.timestamp).toLocaleString()}</p>
            <ul>
              {receipt.items.map(i => (
                <li key={i._id}>{i.product.name} x {i.qty} - ${(i.product.price * i.qty).toFixed(2)}</li>
              ))}
            </ul>
            <button onClick={() => setShowReceipt(false)} className="close-btn">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
