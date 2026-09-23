import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAdminStore } from './admin/adminStore';
import { getCart, getCartCount, getCartSubtotal, updateCartQuantity, removeFromCart, clearCart } from './cartStore';
import GPayModal from './GPayModal';
import grassTornBg from './assets/grass-torn-top.jpg';
import './Footer.css';

export default function Footer() {
  const [store, setStore] = useState(getAdminStore());
  const [activeModal, setActiveModal] = useState(null); // 'settings', 'wishlist', 'cart', null
  const [cartItems, setCartItems] = useState(getCart());
  const [cartCount, setCartCount] = useState(getCartCount());
  const [cartSubtotal, setCartSubtotal] = useState(getCartSubtotal());
  const [isGPayModalOpen, setIsGPayModalOpen] = useState(false);
  const [currency, setCurrency] = useState('INR (₹)');
  const [language, setLanguage] = useState('English');
  const navigate = useNavigate();

  useEffect(() => {
    const handleUpdate = () => {
      setStore(getAdminStore());
    };
    const syncCart = () => {
      const items = getCart();
      setCartItems(items);
      setCartCount(getCartCount(items));
      setCartSubtotal(getCartSubtotal(items));
    };
    syncCart();
    window.addEventListener('admin_store_updated', handleUpdate);
    window.addEventListener('onion_store_cart_updated', syncCart);
    window.addEventListener('storage', syncCart);
    return () => {
      window.removeEventListener('admin_store_updated', handleUpdate);
      window.removeEventListener('onion_store_cart_updated', syncCart);
      window.removeEventListener('storage', syncCart);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleMobileNavClick = (tab) => {
    if (tab === 'home') {
      navigate('/');
      scrollToTop();
      setActiveModal(null);
    } else if (tab === 'ontop') {
      scrollToTop();
    } else {
      setActiveModal(activeModal === tab ? null : tab);
    }
  };

  const settings = store.settings || {};

  return (
    <footer className="greenbee-footer-wrapper">
      
      {/* 1. Top Decorative Grass & Torn Paper Transition Banner */}
      <div className="greenbee-footer-grass-banner" style={{ backgroundImage: `url(${grassTornBg})` }}>
        <div className="grass-banner-overlay" />
      </div>

      {/* 2. Main Footer Body Container */}
      <div className="greenbee-footer-main">
        <div className="greenbee-footer-container">
          
          {/* Top Benefits / Features Row */}
          <div className="greenbee-features-row">
            
            {/* Feature 1: Cash on Delivery */}
            <div className="greenbee-feature-card">
              <div className="greenbee-feature-icon-emblem">
                <svg className="greenbee-sketch-ring" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" stroke="#6db327" strokeWidth="2.5" fill="none" strokeDasharray="6 3 9 4" />
                  <circle cx="50" cy="50" r="40" stroke="#87cc45" strokeWidth="1.2" fill="none" strokeDasharray="12 4 8 3" />
                  <circle cx="50" cy="50" r="47" stroke="#6db327" strokeWidth="1" strokeOpacity="0.4" fill="none" />
                </svg>
                <div className="greenbee-feature-icon-inner">
                  {/* Wallet / Money Icon */}
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#6db327" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                    <circle cx="16" cy="14" r="1.5" fill="#6db327" />
                  </svg>
                </div>
              </div>
              <div className="greenbee-feature-text">
                <h3 className="greenbee-feature-title">CASH ON DELIVERY</h3>
                <p className="greenbee-feature-desc">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam sit amet tellus mauris
                </p>
              </div>
            </div>

            {/* Feature 2: Free Shipping */}
            <div className="greenbee-feature-card">
              <div className="greenbee-feature-icon-emblem">
                <svg className="greenbee-sketch-ring" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" stroke="#6db327" strokeWidth="2.5" fill="none" strokeDasharray="7 4 11 3" />
                  <circle cx="50" cy="50" r="40" stroke="#87cc45" strokeWidth="1.2" fill="none" strokeDasharray="10 3 6 4" />
                  <circle cx="50" cy="50" r="47" stroke="#6db327" strokeWidth="1" strokeOpacity="0.4" fill="none" />
                </svg>
                <div className="greenbee-feature-icon-inner">
                  {/* Delivery Truck Icon */}
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#6db327" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                    <path d="M5 9l2 2 4-4" strokeWidth="1.8" />
                  </svg>
                </div>
              </div>
              <div className="greenbee-feature-text">
                <h3 className="greenbee-feature-title">FREE SHIPPING</h3>
                <p className="greenbee-feature-desc">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam sit amet tellus mauris
                </p>
              </div>
            </div>

            {/* Feature 3: Money Back Guarantee */}
            <div className="greenbee-feature-card">
              <div className="greenbee-feature-icon-emblem">
                <svg className="greenbee-sketch-ring" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" stroke="#6db327" strokeWidth="2.5" fill="none" strokeDasharray="9 3 5 4" />
                  <circle cx="50" cy="50" r="40" stroke="#87cc45" strokeWidth="1.2" fill="none" strokeDasharray="14 4 8 2" />
                  <circle cx="50" cy="50" r="47" stroke="#6db327" strokeWidth="1" strokeOpacity="0.4" fill="none" />
                </svg>
                <div className="greenbee-feature-icon-inner">
                  {/* Coins Stack / Money Guarantee Icon */}
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#6db327" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <ellipse cx="12" cy="6" rx="8" ry="3" />
                    <path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
                    <path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
                  </svg>
                </div>
              </div>
              <div className="greenbee-feature-text">
                <h3 className="greenbee-feature-title">MONEY BACK GUARANTEE</h3>
                <p className="greenbee-feature-desc">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam sit amet tellus mauris
                </p>
              </div>
            </div>

          </div>

          {/* Middle 4-Column Footer Navigation Links */}
          <div className="greenbee-links-grid">
            
            {/* Column 1: Customer Service */}
            <div className="greenbee-footer-col">
              <h4 className="greenbee-footer-col-title">CUSTOMER SERVICE</h4>
              <ul className="greenbee-footer-links-list">
                <li><Link to="/contact-us">Contact Us & Inquiries</Link></li>
                <li><Link to="/faq">Frequently Asked Questions</Link></li>
                <li><Link to="/products">1kg to 10kg Onion Packs</Link></li>
                <li><Link to="/faq">Punjab Express Delivery</Link></li>
                <li><Link to="/contact-us">Bulk Supply & Corporate Booking</Link></li>
              </ul>
            </div>

            {/* Column 2: Information */}
            <div className="greenbee-footer-col">
              <h4 className="greenbee-footer-col-title">QUICK PAGES</h4>
              <ul className="greenbee-footer-links-list">
                <li><Link to="/">Home Store</Link></li>
                <li><Link to="/products">All Products Catalog</Link></li>
                <li><Link to="/about-us">Our 4 Regional Hubs</Link></li>
                <li><Link to="/our-farmers">Farmer Partnership Pledge</Link></li>
                <li><Link to="/blog">Farming Journal & Tips</Link></li>
                <li><Link to="/admin" style={{ color: '#6db327', fontWeight: '600' }}>Branch / Admin Portal 🔐</Link></li>
              </ul>
            </div>

            {/* Column 3: About Us */}
            <div className="greenbee-footer-col">
              <h4 className="greenbee-footer-col-title">ABOUT OUR FARM</h4>
              <ul className="greenbee-footer-links-list">
                <li><Link to="/about-us">Our Farm-to-Table Story</Link></li>
                <li><Link to="/our-farmers">100% Zero-Residue Promise</Link></li>
                <li><Link to="/about-us">Amritsar & Jalandhar Depots</Link></li>
                <li><Link to="/about-us">Batala & Gurdaspur Mandis</Link></li>
                <li><Link to="/blog">Storage & Nutrition Guide</Link></li>
              </ul>
            </div>

            {/* Column 4: Contact Us */}
            <div className="greenbee-footer-col greenbee-contact-col">
              <h4 className="greenbee-footer-col-title">PUNJAB HEAD OFFICE</h4>
              <ul className="greenbee-contact-list">
                <li>
                  <svg className="contact-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <a href={`tel:${(settings.contactHotline || '+91 98765 43210').replace(/\s+/g, '')}`}>
                    {settings.contactHotline || '+91 98765 43210'}
                  </a>
                </li>
                <li>
                  <svg className="contact-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <a href={`mailto:${settings.supportEmail || 'support@theonionstore.in'}`}>
                    {settings.supportEmail || 'support@theonionstore.in'}
                  </a>
                </li>
                <li>
                  <svg className="contact-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>GT Road, Near Alpha One Mall, Amritsar</span>
                </li>
                <li>
                  <svg className="contact-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>Daily Dispatch: {settings.workingHours || '7:00 AM – 9:30 PM'}</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* 3. Sub-Footer Bar (Copyright & Payment Icons) */}
      <div className="greenbee-subfooter-bar">
        <div className="greenbee-footer-container greenbee-subfooter-container">
          
          {/* Copyright Notice */}
          <div className="greenbee-copyright-text">
            Copyright &copy; 2026 {settings.siteTitle || 'The Onion Store'} - Farm to Store. All rights reserved.
          </div>

          {/* Payment Provider Badges */}
          <div className="greenbee-payment-badges">
            {/* Amex */}
            <span className="payment-badge amex" title="American Express">
              <span className="badge-text">AMEX</span>
            </span>

            {/* Mastercard */}
            <span className="payment-badge mastercard" title="Mastercard">
              <svg viewBox="0 0 36 24" width="32" height="20">
                <circle cx="14" cy="12" r="9" fill="#eb001b" />
                <circle cx="22" cy="12" r="9" fill="#f79e1b" fillOpacity="0.8" />
              </svg>
            </span>

            {/* Visa */}
            <span className="payment-badge visa" title="Visa">
              <span className="badge-text visa-text">VISA</span>
            </span>

            {/* PayPal */}
            <span className="payment-badge paypal" title="PayPal">
              <span className="badge-text paypal-text"><i>Pay</i><em>Pal</em></span>
            </span>

            {/* DBS / Discover */}
            <span className="payment-badge dbs" title="DBS">
              <span className="badge-text dbs-text">DBS</span>
            </span>
          </div>

          {/* Desktop Floating Scroll to Top Button */}
          <button
            type="button"
            className="greenbee-scroll-top-btn"
            onClick={scrollToTop}
            aria-label="Scroll to top of page"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0a6637" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>

        </div>
      </div>

      {/* 4. EXACT MOBILE BOTTOM FOOTER TOOLBAR (Fixed to Bottom in Mobile) */}
      <div className="mobile-bottom-footer-bar">
        {/* 1. Home */}
        <button 
          type="button"
          className="mobile-bottom-nav-item"
          onClick={() => handleMobileNavClick('home')}
          aria-label="Go to Home"
        >
          <div className="mobile-nav-icon-box">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span className="mobile-nav-label">Home</span>
        </button>

        {/* 2. Wishlist */}
        <button 
          type="button"
          className="mobile-bottom-nav-item"
          onClick={() => handleMobileNavClick('wishlist')}
          aria-label="Open Wishlist"
        >
          <div className="mobile-nav-icon-box">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <span className="mobile-nav-label">Wishlist</span>
        </button>

        {/* 3. Cart with Badge (5) */}
        <button 
          type="button"
          className="mobile-bottom-nav-item"
          onClick={() => handleMobileNavClick('cart')}
          aria-label="Open Cart"
        >
          <div className="mobile-nav-icon-box cart-nav-box">
            {/* Basket style cart icon */}
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6-6 6 6" />
              <path d="M2 9h20l-2 11H4L2 9z" />
              <line x1="12" y1="13" x2="12" y2="17" />
              <line x1="8" y1="13" x2="8.5" y2="17" />
              <line x1="16" y1="13" x2="15.5" y2="17" />
            </svg>
            <span className="mobile-cart-badge">{cartCount}</span>
          </div>
          <span className="mobile-nav-label">Cart</span>
        </button>

        {/* 4. Setting */}
        <button 
          type="button"
          className="mobile-bottom-nav-item"
          onClick={() => handleMobileNavClick('settings')}
          aria-label="Open Settings"
        >
          <div className="mobile-nav-icon-box">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
          <span className="mobile-nav-label">Setting</span>
        </button>

        {/* 5. On Top */}
        <button 
          type="button"
          className="mobile-bottom-nav-item"
          onClick={() => handleMobileNavClick('ontop')}
          aria-label="Scroll to top"
        >
          <div className="mobile-nav-icon-box">
            {/* Exactly matching upward triangle with horizontal line glyph */}
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <polygon points="12 4 4 14 20 14" />
              <rect x="4" y="17" width="16" height="2.5" rx="0.5" />
            </svg>
          </div>
          <span className="mobile-nav-label">On Top</span>
        </button>
      </div>

      {/* Slide-Up / Bottom Drawers for Mobile Interactions */}
      {activeModal && (
        <div className="mobile-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="mobile-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-sheet-handle" />
            
            <div className="mobile-sheet-header">
              <h3>
                {activeModal === 'settings' && 'Store Settings'}
                {activeModal === 'wishlist' && 'Your Wishlist'}
                {activeModal === 'cart' && `Shopping Bag (${cartCount})`}
              </h3>
              <button className="sheet-close-btn" onClick={() => setActiveModal(null)}>✕</button>
            </div>

            <div className="mobile-sheet-body">
              {activeModal === 'settings' && (
                <div className="settings-options-list">
                  <div className="setting-option-group">
                    <label>Currency</label>
                    <div className="setting-chips">
                      {['USD ($)', 'EUR (€)', 'INR (₹)', 'GBP (£)'].map((c) => (
                        <button 
                          key={c}
                          className={`setting-chip ${currency === c ? 'active' : ''}`}
                          onClick={() => setCurrency(c)}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="setting-option-group">
                    <label>Language</label>
                    <div className="setting-chips">
                      {['English', 'Français', 'Español', 'Deutsch'].map((l) => (
                        <button 
                          key={l}
                          className={`setting-chip ${language === l ? 'active' : ''}`}
                          onClick={() => setLanguage(l)}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="setting-links-group">
                    <Link to="/admin" className="setting-link-item" onClick={() => setActiveModal(null)} style={{ fontWeight: 'bold', color: '#0a6637' }}>
                      🔐 Admin & Branch Staff Portal
                    </Link>
                    <a href="#my-account" className="setting-link-item">My Account</a>
                    <a href="#order-tracking" className="setting-link-item">Order Tracking</a>
                    <a href="#help" className="setting-link-item">Help Center</a>
                  </div>
                </div>
              )}

              {activeModal === 'wishlist' && (
                <div className="sheet-info-box">
                  <p>Your wishlist is currently updated with favorite onion selections.</p>
                  <a href="#fresh-onions-section" className="sheet-primary-btn" onClick={() => setActiveModal(null)}>
                    Explore Fresh Onions
                  </a>
                </div>
              )}

              {activeModal === 'cart' && (
                <div className="sheet-cart-wrapper">
                  {cartItems.length === 0 ? (
                    <div className="sheet-info-box">
                      <p>Your shopping bag is currently empty.</p>
                      <a href="#fresh-onions-section" className="sheet-primary-btn" onClick={() => setActiveModal(null)}>
                        Explore Fresh Onions
                      </a>
                    </div>
                  ) : (
                    <div>
                      <div style={{ maxHeight: '220px', overflowY: 'auto', marginBottom: '14px' }}>
                        {cartItems.map((item) => (
                          <div 
                            key={item.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 0',
                              borderBottom: '1px solid #f0e2ec',
                              gap: '10px'
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                              <strong style={{ fontSize: '13px', color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.name}
                              </strong>
                              <span style={{ fontSize: '11px', color: '#74114e', fontWeight: 600 }}>
                                {item.weight} &bull; ₹{Number(item.price).toFixed(2)}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d8cbd5', borderRadius: '4px' }}>
                                <button 
                                  type="button" 
                                  onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                  style={{ padding: '2px 8px', border: 'none', background: '#faf4f8', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                  −
                                </button>
                                <span style={{ padding: '0 6px', fontSize: '12px', fontWeight: 700 }}>{item.quantity}</span>
                                <button 
                                  type="button" 
                                  onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                  style={{ padding: '2px 8px', border: 'none', background: '#faf4f8', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                  +
                                </button>
                              </div>

                              <strong style={{ fontSize: '13px', color: '#74114e', minWidth: '45px', textAlign: 'right' }}>
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </strong>

                              <button 
                                type="button" 
                                onClick={() => removeFromCart(item.id)}
                                style={{ border: 'none', background: 'none', color: '#aaa', cursor: 'pointer', fontSize: '14px' }}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ padding: '12px', background: '#faf4f8', borderRadius: '8px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#555' }}>Subtotal:</span>
                          <span style={{ fontSize: '17px', fontWeight: 900, color: '#74114e' }}>₹{cartSubtotal.toFixed(2)}</span>
                        </div>
                        <span style={{ fontSize: '11px', color: '#0a6637', fontWeight: 700, display: 'block' }}>
                          ⚡ Same-day express delivery available across Punjab
                        </span>
                      </div>

                      <button
                        type="button"
                        className="sheet-primary-btn"
                        onClick={() => {
                          setActiveModal(null);
                          setIsGPayModalOpen(true);
                        }}
                        style={{ display: 'block', width: '100%', textAlign: 'center', background: '#74114e', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', marginBottom: '8px' }}
                      >
                        💳 Pay with G-Pay / Checkout ({cartCount})
                      </button>

                      <a 
                        href={`https://wa.me/${(store?.settings?.contactHotline || '919876543210').replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Hello The Onion Store! I would like to place an order for:\n` +
                          cartItems.map(i => `• ${i.quantity}x ${i.name} (${i.weight}) - ₹${(i.price * i.quantity).toFixed(2)}`).join('\n') +
                          `\n\nTotal Amount: ₹${cartSubtotal.toFixed(2)}`
                        )}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ display: 'block', textAlign: 'center', fontSize: '11.5px', color: '#0a6637', fontWeight: 700, textDecoration: 'underline' }}
                        onClick={() => setActiveModal(null)}
                      >
                        📱 Direct WhatsApp Order Slip
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* G-Pay & UPI Quick Checkout Modal */}
      <GPayModal 
        isOpen={isGPayModalOpen}
        onClose={() => setIsGPayModalOpen(false)}
        cartItems={cartItems}
        cartTotal={cartSubtotal}
        store={store}
      />

    </footer>
  );
}

