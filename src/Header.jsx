import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { getAdminStore } from './admin/adminStore';
import { getCart, getCartCount, getCartSubtotal, updateCartQuantity, removeFromCart, clearCart } from './cartStore';
import GPayModal from './GPayModal';
import logoImg from './assets/logo.png';
import './Header.css';

export default function Header() {
  const [store, setStore] = useState(getAdminStore());
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isCategoriesDrawerOpen, setIsCategoriesDrawerOpen] = useState(false);
  const [isMainMenuDrawerOpen, setIsMainMenuDrawerOpen] = useState(false);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState({});
  const [cartItems, setCartItems] = useState(getCart());
  const [cartCount, setCartCount] = useState(getCartCount());
  const [cartSubtotal, setCartSubtotal] = useState(getCartSubtotal());
  const [isScrolled, setIsScrolled] = useState(false);
  const [isGPayModalOpen, setIsGPayModalOpen] = useState(false);

  const headerRef = useRef(null);

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

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sticky header effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scrolling when a mobile drawer is open
  useEffect(() => {
    if (isCategoriesDrawerOpen || isMainMenuDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isCategoriesDrawerOpen, isMainMenuDrawerOpen]);

  const toggleDropdown = (name) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const toggleMobileAccordion = (menuKey) => {
    setExpandedMobileMenu((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      alert(`Searching for: ${searchTerm}`);
    }
  };

  const closeAllDrawers = () => {
    setIsCategoriesDrawerOpen(false);
    setIsMainMenuDrawerOpen(false);
  };

  const handleNavClick = (e, targetSelector) => {
    e.preventDefault();
    closeAllDrawers();

    if (!targetSelector || targetSelector === '#' || targetSelector === '#home') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      return;
    }

    const elem = document.querySelector(targetSelector);
    if (elem) {
      const headerOffset = window.innerWidth > 860 ? 80 : 60;
      const elementPosition = elem.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const settings = store.settings || {};
  const logoSrc = settings.customLogoUrl || logoImg;
  const social = settings.socialLinks || {};

  return (
    <header className={`greenbee-header-wrapper ${isScrolled ? 'is-sticky' : ''}`} ref={headerRef}>
      
      {/* Top Announcement Bar (Configurable in Admin Settings) */}
      {settings.showAnnouncement !== false && settings.announcementText && (
        <div 
          className="greenbee-announcement-bar" 
          style={{ 
            background: settings.primaryColor || '#74114e', 
            color: '#ffffff', 
            textAlign: 'center', 
            padding: '6px 14px', 
            fontSize: '11.5px', 
            fontWeight: '600',
            letterSpacing: '0.2px'
          }}
        >
          <span>{settings.announcementText}</span>
        </div>
      )}

      {/* ============================================================
          1. DESKTOP HEADER (Visible on screens > 860px)
         ============================================================ */}
      <div className="greenbee-desktop-header">
        
        {/* Top Header Bar (Emerald Green / Configurable) */}
        <div className="greenbee-top-bar" style={{ backgroundColor: settings.topBarBgColor || undefined }}>
          <div className="greenbee-container greenbee-top-container">
            
            {/* Left: Social Media Icons in Top Bar */}
            <div className="greenbee-social-group greenbee-top-socials">
              <a href={social.facebook || "https://facebook.com"} target="_blank" rel="noopener noreferrer" className="greenbee-social-icon-btn" aria-label="Facebook">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>

              <a href={social.twitter || "https://twitter.com"} target="_blank" rel="noopener noreferrer" className="greenbee-social-icon-btn" aria-label="Twitter">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                </svg>
              </a>

              <a href={social.pinterest || "https://pinterest.com"} target="_blank" rel="noopener noreferrer" className="greenbee-social-icon-btn" aria-label="Pinterest">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.04-2.83.19-.78 1.25-5.3 1.25-5.3s-.32-.64-.32-1.58c0-1.48.86-2.59 1.93-2.59.91 0 1.35.68 1.35 1.5 0 .91-.58 2.28-.88 3.55-.25 1.06.53 1.92 1.57 1.92 1.89 0 3.35-1.99 3.35-4.86 0-2.54-1.83-4.32-4.44-4.32-3.03 0-4.81 2.27-4.81 4.62 0 .91.35 1.89.79 2.43.09.1.1.19.07.33-.08.33-.26 1.05-.29 1.2-.05.2-.16.24-.37.15-1.38-.64-2.24-2.65-2.24-4.27 0-3.48 2.53-6.67 7.29-6.67 3.83 0 6.81 2.73 6.81 6.38 0 3.8-2.4 6.86-5.73 6.86-1.12 0-2.17-.58-2.53-1.27l-.69 2.63c-.25.96-.93 2.16-1.39 2.9A10 10 0 1 0 12 2z" />
                </svg>
              </a>

              <a href={social.youtube || "https://youtube.com"} target="_blank" rel="noopener noreferrer" className="greenbee-social-icon-btn" aria-label="YouTube">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              <a href={social.instagram || "https://instagram.com"} target="_blank" rel="noopener noreferrer" className="greenbee-social-icon-btn" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>

            {/* Center: Search Bar */}
            <form className="greenbee-search-form" onSubmit={handleSearchSubmit}>
              <div className="greenbee-search-wrapper">
                <input
                  type="text"
                  placeholder="Enter your keyword"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="greenbee-search-input"
                  aria-label="Search"
                />
                <button type="submit" className="greenbee-search-btn" aria-label="Submit search">
                  <svg
                    className="greenbee-search-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Right: Admin Portal & Cart Widget in Top Bar */}
            <div className="greenbee-top-right-actions">
              <Link 
                to="/admin" 
                className="greenbee-admin-top-btn" 
                title="Admin & Branch Staff Login"
                aria-label="Admin & Branch Staff Portal"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span>ADMIN / BRANCH</span>
              </Link>

              <div className="greenbee-cart-container">
                <div
                  className="greenbee-cart-pill"
                  onClick={() => toggleDropdown('cart')}
                  role="button"
                  tabIndex={0}
                  aria-label="View Shopping Cart"
                >
                  <div className="greenbee-cart-circle-btn">
                    <svg
                      className="greenbee-basket-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    <span className="greenbee-cart-badge">{cartCount}</span>
                  </div>
                  <span className="greenbee-cart-text">MY CART</span>
                </div>

                {/* Cart Dropdown */}
                {activeDropdown === 'cart' && (
                  <div className={`greenbee-dropdown-menu greenbee-cart-dropdown ${cartItems.length > 0 ? 'has-items' : ''}`} onClick={(e) => e.stopPropagation()}>
                    {cartItems.length === 0 ? (
                      <div className="greenbee-cart-empty">
                        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#25a85c" strokeWidth="1.5">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        <p className="empty-cart-msg">Your shopping cart is empty!</p>
                        <button className="greenbee-btn-shop" onClick={() => setActiveDropdown(null)}>
                          CONTINUE SHOPPING
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="cart-dropdown-header">
                          <span className="cart-header-title">My Cart ({cartCount} {cartCount === 1 ? 'pack' : 'packs'})</span>
                          <button className="cart-clear-btn" onClick={() => clearCart()} title="Clear all cart items">
                            Clear All
                          </button>
                        </div>

                        <div className="cart-items-scroll">
                          {cartItems.map((item) => (
                            <div key={item.id} className="cart-item-row">
                              <div className="cart-item-info">
                                <strong className="cart-item-name">{item.name}</strong>
                                <div className="cart-item-meta">
                                  <span className="cart-item-weight">{item.weight}</span>
                                  <span className="cart-item-rate">₹{Number(item.price).toFixed(2)}/pack</span>
                                </div>
                              </div>

                              <div className="cart-item-actions">
                                <div className="cart-qty-ctrls">
                                  <button 
                                    type="button" 
                                    className="cart-qty-btn"
                                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                    title="Decrease quantity"
                                  >
                                    −
                                  </button>
                                  <span className="cart-qty-num">{item.quantity}</span>
                                  <button 
                                    type="button" 
                                    className="cart-qty-btn"
                                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                    title="Increase quantity"
                                  >
                                    +
                                  </button>
                                </div>

                                <span className="cart-item-total">
                                  ₹{(item.price * item.quantity).toFixed(2)}
                                </span>

                                <button 
                                  type="button" 
                                  className="cart-remove-item-btn"
                                  onClick={() => removeFromCart(item.id)}
                                  title="Remove item"
                                  aria-label="Remove item"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="cart-dropdown-footer">
                          <div className="cart-subtotal-row">
                            <span className="subtotal-label">Subtotal:</span>
                            <span className="subtotal-amount">₹{cartSubtotal.toFixed(2)}</span>
                          </div>
                          <div className="cart-delivery-badge">
                            ⚡ Same-Day Express Farm Delivery Available
                          </div>
                          
                          <button
                            type="button"
                            className="cart-checkout-btn"
                            style={{ border: 'none', cursor: 'pointer', marginBottom: '6px' }}
                            onClick={() => {
                              setActiveDropdown(null);
                              setIsGPayModalOpen(true);
                            }}
                          >
                            💳 Pay via G-Pay Scanner / Checkout &rarr;
                          </button>

                          <a 
                            href={`https://wa.me/${(settings.contactHotline || '919876543210').replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Hello The Onion Store! I would like to place an order for:\n` +
                              cartItems.map(i => `• ${i.quantity}x ${i.name} (${i.weight}) - ₹${(i.price * i.quantity).toFixed(2)}`).join('\n') +
                              `\n\nTotal Amount: ₹${cartSubtotal.toFixed(2)}`
                            )}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                              display: 'block',
                              textAlign: 'center',
                              fontSize: '11px',
                              fontWeight: 700,
                              color: '#0a6637',
                              textDecoration: 'underline',
                              marginTop: '4px'
                            }}
                          >
                            📱 Direct Order via WhatsApp
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Navigation Bar (Pale Mint Background) */}
        <nav className="greenbee-bottom-bar">
          <div className="greenbee-container greenbee-bottom-container">
            
            {/* Left: Logo moved to bottom bar */}
            <div className="greenbee-logo-container greenbee-bottom-logo">
              <Link 
                to="/" 
                className="greenbee-logo" 
                aria-label="The Onion Store Home"
              >
                <img src={logoSrc} alt={settings.siteTitle || "The Onion Store Logo"} className="greenbee-logo-img" />
              </Link>
            </div>

            {/* Center: Navigation Menu Links */}
            <ul className="greenbee-nav-list">
              <li className="greenbee-nav-item">
                <NavLink 
                  to="/" 
                  className={({ isActive }) => `greenbee-nav-link ${isActive ? 'active' : ''}`}
                  end
                >
                  HOME
                </NavLink>
              </li>

              <li className="greenbee-nav-item">
                <NavLink 
                  to="/products" 
                  className={({ isActive }) => `greenbee-nav-link ${isActive ? 'active' : ''}`}
                >
                  PRODUCTS
                </NavLink>
              </li>

              <li className="greenbee-nav-item">
                <NavLink 
                  to="/about-us" 
                  className={({ isActive }) => `greenbee-nav-link ${isActive ? 'active' : ''}`}
                >
                  ABOUT US
                </NavLink>
              </li>

              <li className="greenbee-nav-item">
                <NavLink 
                  to="/our-farmers" 
                  className={({ isActive }) => `greenbee-nav-link ${isActive ? 'active' : ''}`}
                >
                  OUR FARMERS
                </NavLink>
              </li>

              <li className="greenbee-nav-item">
                <NavLink 
                  to="/faq" 
                  className={({ isActive }) => `greenbee-nav-link ${isActive ? 'active' : ''}`}
                >
                  FAQ
                </NavLink>
              </li>

              <li className="greenbee-nav-item">
                <NavLink 
                  to="/contact-us" 
                  className={({ isActive }) => `greenbee-nav-link ${isActive ? 'active' : ''}`}
                >
                  CONTACT US
                </NavLink>
              </li>

              <li className="greenbee-nav-item">
                <NavLink 
                  to="/blog" 
                  className={({ isActive }) => `greenbee-nav-link ${isActive ? 'active' : ''}`}
                >
                  BLOG
                </NavLink>
              </li>
            </ul>

            {/* Right: Call Us Button moved to bottom bar */}
            <div className="greenbee-bottom-right-actions">
              <div 
                className={`greenbee-call-pill ${activeDropdown === 'call' ? 'active' : ''}`}
                onClick={() => toggleDropdown('call')}
              >
                <div className="greenbee-call-icon-wrap">
                  <svg
                    className="greenbee-phone-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div className="greenbee-call-text">
                  <span className="greenbee-call-label">CALL US NOW :</span>
                  <span className="greenbee-call-number">{settings.contactHotline || '+91 98765 43210'}</span>
                </div>
                <svg className="greenbee-caret-icon" viewBox="0 0 24 24" width="14" height="14">
                  <path d="M7 10l5 5 5-5z" fill="currentColor" />
                </svg>

                {/* Call dropdown popover */}
                {activeDropdown === 'call' && (
                  <div className="greenbee-dropdown-menu greenbee-call-dropdown" onClick={(e) => e.stopPropagation()}>
                    <div className="dropdown-header">Customer Support</div>
                    <div className="dropdown-item">
                      <strong>Working Hours:</strong> {settings.workingHours || 'Mon - Sun: 7:00 AM - 9:30 PM'}
                    </div>
                    <div className="dropdown-item">
                      <strong>Email:</strong> {settings.supportEmail || 'support@theonionstore.in'}
                    </div>
                    <a href={`tel:${(settings.contactHotline || '+91 98765 43210').replace(/\s+/g, '')}`} className="dropdown-call-action">
                      Call {settings.contactHotline || '+91 98765 43210'} Now
                    </a>
                  </div>
                )}
              </div>
            </div>

          </div>
        </nav>
      </div>

      {/* ============================================================
          2. MOBILE HEADER (Exact screenshot match on <= 860px)
         ============================================================ */}
      <div className="greenbee-mobile-header-bar">
        <div className="greenbee-mobile-header-inner">
          
          {/* Left: Staggered 3-Line Categories Menu Button */}
          <button 
            type="button"
            className="gb-mob-btn gb-mob-categories-btn"
            onClick={() => setIsCategoriesDrawerOpen(true)}
            aria-label="Open Categories Menu"
          >
            <span className="gb-icon-staggered">
              <span className="gb-line gb-line-short" />
              <span className="gb-line gb-line-med" />
              <span className="gb-line gb-line-long" />
            </span>
          </button>

          {/* Logo from assets / dynamic */}
          <Link 
            to="/" 
            className="gb-mob-logo-link" 
            aria-label="The Onion Store Home"
            onClick={closeAllDrawers}
          >
            <img src={logoSrc} alt={settings.siteTitle || "The Onion Store Logo"} className="gb-mob-logo-img" />
          </Link>

          {/* Center Search Input Box */}
          <form className="gb-mob-search-form" onSubmit={handleSearchSubmit}>
            <div className="gb-mob-search-box">
              <input
                type="text"
                placeholder="ENTER YOUR KEYWORD"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="gb-mob-search-input"
                aria-label="Search keywords"
              />
              <button type="submit" className="gb-mob-search-submit" aria-label="Search">
                <svg
                  className="gb-mob-search-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0a6637"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </div>
          </form>

          {/* Right: 4-Bar Main Navigation Menu Button */}
          <button 
            type="button"
            className="gb-mob-btn gb-mob-hamburger-btn"
            onClick={() => setIsMainMenuDrawerOpen(true)}
            aria-label="Open Main Navigation Menu"
          >
            <span className="gb-icon-4bars">
              <span className="gb-bar" />
              <span className="gb-bar" />
              <span className="gb-bar" />
              <span className="gb-bar" />
            </span>
          </button>

        </div>
      </div>

      {/* ============================================================
          3. BRANCH CONTACTS SIDE DRAWER (Opens from Left)
         ============================================================ */}
      <div className={`gb-drawer-overlay ${isCategoriesDrawerOpen ? 'is-open' : ''}`} onClick={closeAllDrawers}>
        <div className="gb-drawer gb-categories-drawer gb-branch-contacts-drawer" onClick={(e) => e.stopPropagation()}>
          
          <div className="gb-drawer-header gb-cat-drawer-header">
            <div className="gb-drawer-title">
              <img src={logoSrc} alt={settings.siteTitle || "The Onion Store"} className="gb-drawer-header-logo" />
              <span>BRANCH CONTACTS</span>
            </div>
            <button className="gb-drawer-close-btn" onClick={closeAllDrawers} aria-label="Close drawer">
              &times;
            </button>
          </div>

          <div className="gb-drawer-body gb-branch-drawer-body">
            {/* Central Helpline Banner */}
            <div className="gb-drawer-central-help">
              <span className="central-help-badge">CENTRAL TOLL-FREE HELPLINE</span>
              <a href={`tel:${(settings.contactHotline || '+91 98765 43210').replace(/\s+/g, '')}`} className="central-help-phone">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                {settings.contactHotline || '+91 98765 43210'}
              </a>
              <span className="central-help-hours">{settings.workingHours || 'Mon - Sun: 7:00 AM - 9:30 PM'}</span>
            </div>

            {/* Dynamic Regional Branch Cards from Admin Store */}
            <div className="gb-drawer-branches-list">
              {(store.branches || []).map((branch) => (
                <div key={branch.id} className="gb-branch-card">
                  <div className="branch-card-header">
                    <div className="branch-name-wrap">
                      <span className="branch-pin-icon">📍</span>
                      <strong className="branch-name">{branch.city} Branch</strong>
                    </div>
                    <span className="branch-status-tag">{branch.badge || 'Hub'}</span>
                  </div>
                  <p className="branch-address">{branch.address}</p>
                  <div className="branch-contact-links">
                    <a href={`tel:${branch.phone.replace(/\s+/g, '')}`} className="branch-contact-link phone">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      <span>{branch.phone}</span>
                    </a>
                    <a href={`mailto:${branch.email}`} className="branch-contact-link email">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      <span>{branch.email}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Link to Contact Section */}
            <div className="gb-drawer-footer-action">
              <Link 
                to="/contact-us" 
                onClick={closeAllDrawers} 
                className="gb-drawer-inquiry-btn"
              >
                Send Bulk Inquiry / Message
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* ============================================================
          4. MAIN NAVIGATION DRAWER (Opens from Right)
         ============================================================ */}
      <div className={`gb-drawer-overlay ${isMainMenuDrawerOpen ? 'is-open' : ''}`} onClick={closeAllDrawers}>
        <div className="gb-drawer gb-main-menu-drawer" onClick={(e) => e.stopPropagation()}>
          
          <div className="gb-drawer-header gb-main-drawer-header">
            <div className="gb-drawer-title">
              <span>MAIN MENU</span>
            </div>
            <button className="gb-drawer-close-btn" onClick={closeAllDrawers} aria-label="Close drawer">
              &times;
            </button>
          </div>

          <div className="gb-drawer-body">
            {/* Direct Navigation Links */}
            <ul className="gb-mobile-nav-accordion">
              {/* HOME */}
              <li className="accordion-item">
                <div className="accordion-head direct-link">
                  <NavLink to="/" end onClick={closeAllDrawers}>HOME</NavLink>
                </div>
              </li>

              {/* PRODUCTS */}
              <li className="accordion-item">
                <div className="accordion-head direct-link">
                  <NavLink to="/products" onClick={closeAllDrawers}>PRODUCTS</NavLink>
                </div>
              </li>

              {/* ABOUT US */}
              <li className="accordion-item">
                <div className="accordion-head direct-link">
                  <NavLink to="/about-us" onClick={closeAllDrawers}>ABOUT US</NavLink>
                </div>
              </li>

              {/* OUR FARMERS */}
              <li className="accordion-item">
                <div className="accordion-head direct-link">
                  <NavLink to="/our-farmers" onClick={closeAllDrawers}>OUR FARMERS</NavLink>
                </div>
              </li>

              {/* FAQ */}
              <li className="accordion-item">
                <div className="accordion-head direct-link">
                  <NavLink to="/faq" onClick={closeAllDrawers}>FAQ</NavLink>
                </div>
              </li>

              {/* CONTACT US */}
              <li className="accordion-item">
                <div className="accordion-head direct-link">
                  <NavLink to="/contact-us" onClick={closeAllDrawers}>CONTACT US</NavLink>
                </div>
              </li>

              {/* BLOG */}
              <li className="accordion-item">
                <div className="accordion-head direct-link">
                  <NavLink to="/blog" onClick={closeAllDrawers}>BLOG</NavLink>
                </div>
              </li>

              {/* ADMIN & BRANCH PORTAL */}
              <li className="accordion-item">
                <div className="accordion-head direct-link admin-drawer-highlight">
                  <NavLink to="/admin" onClick={closeAllDrawers} style={{ color: '#0a6637', fontWeight: 'bold' }}>
                    🔐 ADMIN & BRANCH PORTAL
                  </NavLink>
                </div>
              </li>
            </ul>

            {/* Account & Currency & Social inside Main Drawer */}
            <div className="gb-drawer-extras">
              <div className="gb-drawer-links">
                <a href="#account" onClick={closeAllDrawers} className="gb-drawer-link">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  My Account
                </a>
                <a href="#wishlist" onClick={closeAllDrawers} className="gb-drawer-link">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  Wishlist (0)
                </a>
              </div>

              {/* Social icons */}
              <div className="gb-drawer-socials">
                <a href={social.facebook || "https://facebook.com"} target="_blank" rel="noopener noreferrer" className="greenbee-social-icon-btn" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a href={social.twitter || "https://twitter.com"} target="_blank" rel="noopener noreferrer" className="greenbee-social-icon-btn" aria-label="Twitter">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                  </svg>
                </a>
                <a href={social.pinterest || "https://pinterest.com"} target="_blank" rel="noopener noreferrer" className="greenbee-social-icon-btn" aria-label="Pinterest">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.04-2.83.19-.78 1.25-5.3 1.25-5.3s-.32-.64-.32-1.58c0-1.48.86-2.59 1.93-2.59.91 0 1.35.68 1.35 1.5 0 .91-.58 2.28-.88 3.55-.25 1.06.53 1.92 1.57 1.92 1.89 0 3.35-1.99 3.35-4.86 0-2.54-1.83-4.32-4.44-4.32-3.03 0-4.81 2.27-4.81 4.62 0 .91.35 1.89.79 2.43.09.1.1.19.07.33-.08.33-.26 1.05-.29 1.2-.05.2-.16.24-.37.15-1.38-.64-2.24-2.65-2.24-4.27 0-3.48 2.53-6.67 7.29-6.67 3.83 0 6.81 2.73 6.81 6.38 0 3.8-2.4 6.86-5.73 6.86-1.12 0-2.17-.58-2.53-1.27l-.69 2.63c-.25.96-.93 2.16-1.39 2.9A10 10 0 1 0 12 2z" />
                  </svg>
                </a>
                <a href={social.instagram || "https://instagram.com"} target="_blank" rel="noopener noreferrer" className="greenbee-social-icon-btn" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* G-Pay & UPI Quick Checkout Modal */}
      <GPayModal 
        isOpen={isGPayModalOpen}
        onClose={() => setIsGPayModalOpen(false)}
        cartItems={cartItems}
        cartTotal={cartSubtotal}
        store={store}
      />

    </header>
  );
}
