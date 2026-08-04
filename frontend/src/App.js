import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  ShoppingBag,
  Search,
  X,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Star,
  Eye,
  CreditCard,
  ArrowRight,
  Tag,
  Truck,
  User,
  Printer,
  ShieldCheck
} from 'lucide-react';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // UI State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receipt, setReceipt] = useState(null);
  
  // Promo / Discount State
  const [couponInput, setCouponInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // e.g. 0.1 for 10%
  const [discountError, setDiscountError] = useState('');
  
  // Checkout Form State
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [checkoutData, setCheckoutData] = useState({
    name: 'Kavya Kakkar',
    email: 'kavya@vibecommerce.com',
    address: '123 Vibe Tech Boulevard, Innovation Suite 400',
    cardNumber: '•••• •••• •••• 4242'
  });
  
  // User Profile
  const [user, setUser] = useState({ name: 'Kavya Kakkar', email: 'kavya@vibecommerce.com' });

  // Toast Alerts
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      // Enrich backend products with metadata if not present
      const enriched = res.data.map(p => {
        let category = 'Gadgets';
        let rating = 4.8;
        let reviews = 124;
        
        if (p.name.toLowerCase().includes('headphones') || p.name.toLowerCase().includes('speaker')) {
          category = 'Audio';
          rating = 4.9;
          reviews = 210;
        } else if (p.name.toLowerCase().includes('watch')) {
          category = 'Wearables';
          rating = 4.7;
          reviews = 89;
        } else if (p.name.toLowerCase().includes('charger') || p.name.toLowerCase().includes('adapter')) {
          category = 'Accessories';
          rating = 4.6;
          reviews = 156;
        }

        return {
          ...p,
          category,
          rating,
          reviews,
          inStock: true
        };
      });
      setProducts(enriched);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/cart');
      setCart(res.data.cartItems || []);
      setCartTotal(res.data.total || 0);
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  const addToCart = async (product, qtyToAdd = 1) => {
    try {
      await axios.post('http://localhost:5000/api/cart', { productId: product._id, qty: qtyToAdd });
      await fetchCart();
      addToast(`Added "${product.name}" to cart`, 'success');
      if (quickViewProduct) setQuickViewProduct(null);
    } catch (err) {
      addToast('Could not add item to cart', 'error');
    }
  };

  const removeFromCart = async (id, itemName) => {
    try {
      await axios.delete(`http://localhost:5000/api/cart/${id}`);
      await fetchCart();
      addToast(`Removed "${itemName}" from cart`, 'info');
    } catch (err) {
      addToast('Failed to remove item', 'error');
    }
  };

  const updateQty = async (id, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    try {
      await axios.delete(`http://localhost:5000/api/cart/${id}`);
      const item = cart.find(i => i._id === id);
      if (item) {
        await axios.post('http://localhost:5000/api/cart', { productId: item.productId, qty: newQty });
      }
      await fetchCart();
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const handleApplyCoupon = () => {
    setDiscountError('');
    if (couponInput.trim().toUpperCase() === 'VIBE10') {
      setAppliedDiscount(0.1);
      addToast('10% Discount applied with coupon VIBE10!', 'success');
    } else if (couponInput.trim().toUpperCase() === 'VIBE20') {
      setAppliedDiscount(0.2);
      addToast('20% VIP Discount applied!', 'success');
    } else {
      setDiscountError('Invalid coupon code. Try VIBE10');
      addToast('Invalid coupon code', 'error');
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!checkoutData.name || !checkoutData.email) {
      addToast('Please complete shipping details', 'error');
      return;
    }
    try {
      const payload = {
        cartItems: cart,
        customer: checkoutData
      };
      const res = await axios.post('http://localhost:5000/api/checkout', payload);
      
      const rawTotal = res.data.total;
      const finalDiscountedTotal = rawTotal * (1 - appliedDiscount);
      
      setReceipt({
        ...res.data,
        discountedTotal: finalDiscountedTotal,
        orderId: `VIBE-${Math.floor(100000 + Math.random() * 900000)}`,
        customer: checkoutData,
        paymentMethod: paymentMethod === 'card' ? 'Credit Card' : 'Apple Pay / Digital Wallet'
      });
      
      setShowCheckoutModal(false);
      setShowReceiptModal(true);
      setIsCartOpen(false);
      setUser({ name: checkoutData.name, email: checkoutData.email });
      setAppliedDiscount(0);
      setCouponInput('');
      fetchCart();
      addToast('Order placed successfully!', 'success');
    } catch (error) {
      addToast('Checkout failed. Please try again.', 'error');
      console.error(error);
    }
  };

  const printReceipt = () => {
    window.print();
  };

  // Categories list
  const categories = ['All', 'Audio', 'Wearables', 'Accessories'];

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate Cart Counts and Discount Totals
  const totalCartItemCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const discountAmount = cartTotal * appliedDiscount;
  const finalTotal = cartTotal - discountAmount;
  
  // Free Express Shipping threshold = $150
  const freeShippingThreshold = 150;
  const shippingProgress = Math.min(100, (cartTotal / freeShippingThreshold) * 100);

  return (
    <div className="App">
      {/* Sticky Header Navbar */}
      <header className="navbar">
        <div className="navbar-container">
          <div className="brand" onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}>
            <div className="brand-icon-wrapper">
              <ShoppingBag size={22} />
            </div>
            <div>
              <span className="brand-name">Vibe Commerce</span>
              <span className="brand-badge">PRO</span>
            </div>
          </div>

          {/* Search Box */}
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search premium electronics, audio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                <X size={16} />
              </button>
            )}
          </div>

          {/* Header Action Items */}
          <div className="nav-actions">
            <div className="profile-pill">
              <div className="profile-avatar">
                <User size={14} />
              </div>
              <div className="profile-info">
                <span className="profile-name">{user.name}</span>
                <span className="profile-email">{user.email || 'Guest'}</span>
              </div>
            </div>

            <button className="cart-toggle-btn" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag size={18} />
              <span>Cart</span>
              {totalCartItemCount > 0 && (
                <span className="cart-badge">{totalCartItemCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main App Workspace */}
      <main className="main-content">
        {/* Banner */}
        <div className="promo-banner">
          <div>
            <div className="promo-title">
              <Sparkles size={20} className="sparkle-icon" color="#ec4899" />
              <span>Exclusive Member Discount</span>
            </div>
            <p className="promo-desc">
              Use code <strong style={{ color: '#06b6d4' }}>VIBE10</strong> at checkout for 10% off all flagship accessories.
            </p>
          </div>
          <div className="promo-code-box">
            <Tag size={14} style={{ display: 'inline', marginRight: '6px' }} />
            VIBE10
          </div>
        </div>

        {/* Category Filter Pills & Product Count */}
        <section className="category-filter-section">
          <div className="category-pills">
            {categories.map(cat => (
              <button
                key={cat}
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <span className="product-count-label">
            Showing {filteredProducts.length} of {products.length} Items
          </span>
        </section>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="empty-products">
            <Search className="empty-icon" size={48} />
            <h3>No products found</h3>
            <p>Try searching for another term or selecting a different category.</p>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map(product => (
              <div key={product._id} className="product-card">
                <div className="product-image-wrapper">
                  <img src={product.image} alt={product.name} className="product-image" />
                  <span className="card-badge">{product.category}</span>
                  <div className="quick-view-overlay">
                    <button className="quick-view-btn" onClick={() => setQuickViewProduct(product)}>
                      <Eye size={14} /> Quick View
                    </button>
                  </div>
                </div>

                <div className="product-details">
                  <div className="product-meta">
                    <span className="product-category">{product.category}</span>
                    <div className="rating-box">
                      <Star size={12} fill="#fbbf24" color="#fbbf24" />
                      <span>{product.rating}</span>
                      <span style={{ color: '#64748b', fontSize: '0.7rem' }}>({product.reviews})</span>
                    </div>
                  </div>

                  <h3 className="product-title">{product.name}</h3>

                  <div className="product-bottom-row">
                    <div className="product-price">${product.price.toFixed(2)}</div>
                    <button className="add-cart-btn" onClick={() => addToCart(product)}>
                      <Plus size={16} /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Slide-out Cart Drawer */}
      <div className={`cart-drawer-backdrop ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)} />
      <aside className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-title">
            <ShoppingBag size={20} color="#6366f1" />
            <span>Shopping Cart ({totalCartItemCount})</span>
          </div>
          <button className="close-drawer-btn" onClick={() => setIsCartOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="shipping-bar-container">
          <div className="shipping-text">
            <span>
              <Truck size={14} style={{ display: 'inline', marginRight: 4 }} />
              {cartTotal >= freeShippingThreshold ? (
                <strong style={{ color: '#10b981' }}>Unlocked FREE Express Shipping!</strong>
              ) : (
                `Add $${(freeShippingThreshold - cartTotal).toFixed(2)} more for FREE Express Shipping`
              )}
            </span>
            <span>{Math.round(shippingProgress)}%</span>
          </div>
          <div className="shipping-progress-bg">
            <div className="shipping-progress-fill" style={{ width: `${shippingProgress}%` }} />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="drawer-body">
          {cart.length === 0 ? (
            <div className="empty-cart-view">
              <ShoppingBag className="empty-cart-icon" size={48} />
              <h3>Your cart is empty</h3>
              <p>Browse our catalog and add your favorite items!</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item._id} className="cart-item-card">
                <img
                  src={item.product?.image || 'https://via.placeholder.com/80'}
                  alt={item.product?.name}
                  className="cart-item-thumb"
                />
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.product?.name}</div>
                  <div className="cart-item-price">${(item.product?.price || 0).toFixed(2)}</div>
                  
                  <div className="qty-stepper">
                    <button className="stepper-btn" onClick={() => updateQty(item._id, item.qty, -1)}>
                      <Minus size={12} />
                    </button>
                    <span className="stepper-val">{item.qty}</span>
                    <button className="stepper-btn" onClick={() => updateQty(item._id, item.qty, 1)}>
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                <button
                  className="remove-item-btn"
                  onClick={() => removeFromCart(item._id, item.product?.name)}
                  title="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer & Checkout Action */}
        {cart.length > 0 && (
          <div className="drawer-footer">
            {/* Promo Coupon Field */}
            <div className="coupon-section">
              <input
                type="text"
                placeholder="Promo Code (e.g. VIBE10)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="coupon-input"
              />
              <button className="coupon-btn" onClick={handleApplyCoupon}>
                Apply
              </button>
            </div>
            {discountError && <p style={{ color: '#ec4899', fontSize: '0.75rem', marginTop: '-0.4rem' }}>{discountError}</p>}

            {/* Total Breakdown */}
            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="summary-row" style={{ color: '#10b981' }}>
                  <span>Discount ({(appliedDiscount * 100)}%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Estimated Shipping</span>
                <span>{cartTotal >= freeShippingThreshold ? 'FREE' : '$12.00'}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>${(finalTotal + (cartTotal >= freeShippingThreshold ? 0 : 12)).toFixed(2)}</span>
              </div>
            </div>

            <button
              className="checkout-btn"
              onClick={() => {
                setShowCheckoutModal(true);
              }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </aside>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="modal-overlay" onClick={() => setQuickViewProduct(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Product Details</span>
              <button className="close-drawer-btn" onClick={() => setQuickViewProduct(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="qv-grid">
                <img src={quickViewProduct.image} alt={quickViewProduct.name} className="qv-img" />
                <div className="qv-info">
                  <span className="product-category">{quickViewProduct.category}</span>
                  <h2 style={{ fontSize: '1.2rem', margin: '0.3rem 0 0.6rem' }}>{quickViewProduct.name}</h2>
                  <div className="rating-box" style={{ marginBottom: '0.8rem' }}>
                    <Star size={14} fill="#fbbf24" color="#fbbf24" />
                    <span>{quickViewProduct.rating} rating ({quickViewProduct.reviews} customer reviews)</span>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.4', marginBottom: '1.2rem' }}>
                    Experience top-tier sound, premium materials, and seamless connectivity designed for daily performance.
                  </p>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1rem', color: '#6366f1' }}>
                    ${quickViewProduct.price.toFixed(2)}
                  </div>
                  <button
                    className="add-cart-btn"
                    style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                    onClick={() => addToCart(quickViewProduct)}
                  >
                    <Plus size={18} /> Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="modal-overlay" onClick={() => setShowCheckoutModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="#10b981" />
                <span>Secure Checkout</span>
              </div>
              <button className="close-drawer-btn" onClick={() => setShowCheckoutModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCheckoutSubmit} className="modal-body">
              <h4 style={{ color: '#f8fafc', marginBottom: '0.8rem' }}>Shipping Information</h4>
              
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  value={checkoutData.name}
                  onChange={(e) => setCheckoutData({ ...checkoutData, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  value={checkoutData.email}
                  onChange={(e) => setCheckoutData({ ...checkoutData, email: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Shipping Address</label>
                <input
                  type="text"
                  required
                  value={checkoutData.address}
                  onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })}
                  className="form-input"
                />
              </div>

              <h4 style={{ color: '#f8fafc', margin: '1.2rem 0 0.8rem' }}>Select Payment Method</h4>
              <div className="payment-options">
                <div
                  className={`payment-option-card ${paymentMethod === 'card' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard size={20} style={{ margin: '0 auto 0.3rem' }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>Credit Card</div>
                </div>
                <div
                  className={`payment-option-card ${paymentMethod === 'wallet' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('wallet')}
                >
                  <Sparkles size={20} style={{ margin: '0 auto 0.3rem', color: '#06b6d4' }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>Digital Wallet</div>
                </div>
              </div>

              <div className="summary-rows" style={{ margin: '1rem 0 1.2rem' }}>
                <div className="summary-row total">
                  <span>Order Total:</span>
                  <span>${(finalTotal + (cartTotal >= freeShippingThreshold ? 0 : 12)).toFixed(2)}</span>
                </div>
              </div>

              <button type="submit" className="checkout-btn" style={{ width: '100%' }}>
                <CheckCircle2 size={18} /> Place Order Now
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && receipt && (
        <div className="modal-overlay" onClick={() => setShowReceiptModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-body" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div className="receipt-icon-circle">
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.2rem' }}>Order Confirmed!</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Receipt ID: <strong style={{ color: '#06b6d4' }}>{receipt.orderId}</strong>
              </p>

              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '0.8rem', textAlign: 'left', fontSize: '0.85rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ color: '#94a3b8' }}>Customer:</span>
                  <strong>{receipt.customer?.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ color: '#94a3b8' }}>Date:</span>
                  <span>{new Date(receipt.timestamp).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Payment:</span>
                  <span>{receipt.paymentMethod}</span>
                </div>
              </div>

              <div className="receipt-items-list" style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items Summary</h4>
                {receipt.items?.map(i => (
                  <div key={i._id} className="receipt-item-row">
                    <span>{i.product?.name} x {i.qty}</span>
                    <strong>${((i.product?.price || 0) * i.qty).toFixed(2)}</strong>
                  </div>
                ))}
                <div className="receipt-item-row" style={{ fontWeight: '800', fontSize: '1rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <span>Total Paid</span>
                  <span style={{ color: '#10b981' }}>${receipt.discountedTotal.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.2rem' }}>
                <button
                  className="coupon-btn"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  onClick={printReceipt}
                >
                  <Printer size={16} /> Print Receipt
                </button>
                <button
                  className="add-cart-btn"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setShowReceiptModal(false)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Alerts */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <Sparkles size={16} color={toast.type === 'success' ? '#10b981' : '#6366f1'} />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
