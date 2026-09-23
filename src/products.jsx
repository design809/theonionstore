import React, { useState, useEffect, useRef } from 'react'
import { getAdminStore, resolveProductImage } from './admin/adminStore'
import './products.css'

import onion1kg from './assets/onion-1kg.png'

// Visualizer component for organic multi-bundle representation
export function BundleVisualizer({ count, image, alt, isModal = false }) {
  const units = Array.from({ length: Math.min(10, Math.max(1, count)) })
  const bundleImg = resolveProductImage(image) || onion1kg

  return (
    <div className={`bundle-composition bundle-count-${count} ${isModal ? 'is-modal' : ''}`}>
      {units.map((_, idx) => (
        <img
          key={idx}
          src={bundleImg}
          alt={`${alt} bundle ${idx + 1}`}
          loading="lazy"
          className={`bundle-unit bundle-unit-${idx + 1}`}
        />
      ))}
      <span className="bundle-indicator-pill">
        {count}x {count === 1 ? 'Bundle' : 'Bundles'} ({count}kg)
      </span>
    </div>
  )
}

import { addToCart, getCartCount } from './cartStore'

export default function Products() {
  const [store, setStore] = useState(getAdminStore())
  const [wishlist, setWishlist] = useState([])
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [selectedWeight, setSelectedWeight] = useState('1kg')
  const [quantity, setQuantity] = useState(1)
  const [toastMessage, setToastMessage] = useState(null)
  const [cartCount, setCartCount] = useState(getCartCount())
  const gridRef = useRef(null)

  const productsList = store.products || []

  useEffect(() => {
    const handleUpdate = () => {
      setStore(getAdminStore())
    }
    const handleCartSync = () => {
      setCartCount(getCartCount())
    }
    window.addEventListener('admin_store_updated', handleUpdate)
    window.addEventListener('onion_store_cart_updated', handleCartSync)
    return () => {
      window.removeEventListener('admin_store_updated', handleUpdate)
      window.removeEventListener('onion_store_cart_updated', handleCartSync)
    }
  }, [])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  const toggleWishlist = (e, id, name) => {
    e.stopPropagation()
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(item => item !== id))
      showToast(`Removed "${name}" from Wishlist`)
    } else {
      setWishlist([...wishlist, id])
      showToast(`Added "${name}" to Wishlist ♡`)
    }
  }

  const handleAddToCart = (e, product) => {
    e.stopPropagation()
    addToCart(product, 1, product.weight)
    showToast(`Added 1x (${product.weight}) "${product.name}" to Cart! 🛒`)
  }

  const openQuickView = (product) => {
    setQuickViewProduct(product)
    setSelectedWeight(product.weight || '1kg')
    setQuantity(1)
  }

  const closeQuickView = () => {
    setQuickViewProduct(null)
  }

  const handleModalAddToCart = () => {
    if (!quickViewProduct) return
    const origWeightNum = parseInt(quickViewProduct.weight) || 1
    const targetWeightNum = parseInt(selectedWeight) || origWeightNum
    const weightMultiplier = targetWeightNum / origWeightNum || 1
    
    const adjustedProduct = {
      ...quickViewProduct,
      price: quickViewProduct.price * weightMultiplier,
      weight: selectedWeight
    }
    
    addToCart(adjustedProduct, quantity, selectedWeight)
    showToast(`Added ${quantity}x (${selectedWeight}) "${quickViewProduct.name}" to Cart! 🛒`)
    closeQuickView()
  }

  const scrollGrid = (direction) => {
    if (gridRef.current) {
      const scrollAmount = gridRef.current.clientWidth * 0.85
      gridRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section className="products-section" id="fresh-onions-section">
      <div className="products-container">
        
        {/* Section Header with Title & Arrow Navigation */}
        <div className="products-header">
          <div className="header-text-group">
            <h2 className="section-title">Fresh Red Onions</h2>
            <p className="section-subtitle">
              Farm-to-store fresh red onion bundles from 1kg to 10kg sacks
            </p>
          </div>

          <div className="header-nav-arrows">
            <button 
              className="nav-arrow-btn prev-btn" 
              onClick={() => scrollGrid('left')}
              aria-label="Previous products"
              title="Previous products"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button 
              className="nav-arrow-btn next-btn" 
              onClick={() => scrollGrid('right')}
              aria-label="Next products"
              title="Next products"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>

        {/* 10 Products Grid (1kg to 10kg) */}
        <div className="products-grid-wrapper" ref={gridRef}>
          <div className="products-grid">
            {productsList.map((product) => {
              const isWishlisted = wishlist.includes(product.id)

              return (
                <div 
                  key={product.id} 
                  className="product-card"
                  onClick={() => openQuickView(product)}
                >
                  {/* Top Badges (NEW / Discount) */}
                  <div className="product-badges">
                    {product.isNew && (
                      <span className="badge badge-new">NEW</span>
                    )}
                    {product.discount && (
                      <span className="badge badge-discount">{product.discount}</span>
                    )}
                  </div>

                  {/* Product Image Area & Hover Action Icons */}
                  <div className="product-image-box">
                    <BundleVisualizer 
                      count={product.id} 
                      image={product.image} 
                      alt={product.name} 
                    />

                    {/* Quick Action Floating Buttons (Cart + Quick View + Wishlist) */}
                    <div className="product-quick-actions" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="quick-action-btn add-cart-btn" 
                        onClick={(e) => handleAddToCart(e, product)}
                        title="Add to Cart"
                        aria-label="Add to Cart"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                      </button>

                      <button 
                        className="quick-action-btn quick-view-btn" 
                        onClick={() => openQuickView(product)}
                        title="Quick View"
                        aria-label="Quick View"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                      </button>

                      <button 
                        className={`quick-action-btn wishlist-btn ${isWishlisted ? 'active' : ''}`}
                        onClick={(e) => toggleWishlist(e, product.id, product.name)}
                        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                        aria-label="Wishlist"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill={isWishlisted ? "#e53935" : "none"} stroke={isWishlisted ? "#e53935" : "currentColor"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="product-details">
                    <h3 className="product-title" title={product.name}>
                      {product.name}
                    </h3>

                    <div className="product-price-row">
                      <span className="current-price">₹{product.price.toFixed(2)}</span>
                      {product.oldPrice && (
                        <span className="old-price">₹{product.oldPrice.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* Quick View / Options Modal */}
      {quickViewProduct && (
        <div className="modal-backdrop" onClick={closeQuickView}>
          <div className="quickview-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeQuickView} aria-label="Close modal">
              ✕
            </button>

            <div className="modal-content-grid">
              <div className="modal-image-col">
                <div className="modal-main-img-wrapper">
                  <BundleVisualizer 
                    count={parseInt(selectedWeight) || 1} 
                    image={quickViewProduct.image} 
                    alt={quickViewProduct.name}
                    isModal={true}
                  />
                  {quickViewProduct.discount && (
                    <span className="modal-discount-tag">{quickViewProduct.discount} OFF</span>
                  )}
                </div>
              </div>

              <div className="modal-info-col">
                <span className="modal-category">{quickViewProduct.category}</span>
                <h2 className="modal-title">{quickViewProduct.name}</h2>

                <div className="modal-rating-row">
                  <div className="stars">★★★★★</div>
                  <span className="rating-count">(18 customer reviews)</span>
                  <span className="stock-badge in-stock">● In Stock</span>
                </div>

                <div className="modal-price-row">
                  <span className="modal-current-price">
                    ₹{(quickViewProduct.price * (parseInt(selectedWeight) / parseInt(quickViewProduct.weight) || 1)).toFixed(2)}
                  </span>
                  {quickViewProduct.oldPrice && (
                    <span className="modal-old-price">
                      ₹{(quickViewProduct.oldPrice * (parseInt(selectedWeight) / parseInt(quickViewProduct.weight) || 1)).toFixed(2)}
                    </span>
                  )}
                </div>

                <p className="modal-desc">{quickViewProduct.description}</p>

                {/* Weight Option Selector (1kg - 10kg) */}
                <div className="modal-weight-selector">
                  <label className="weight-label">Select Pack Size:</label>
                  <div className="weight-chips">
                    {['1kg', '2kg', '3kg', '4kg', '5kg', '6kg', '7kg', '8kg', '9kg', '10kg'].map((w) => (
                      <button 
                        key={w}
                        type="button"
                        className={`weight-chip ${selectedWeight === w ? 'active' : ''}`}
                        onClick={() => setSelectedWeight(w)}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity & Add to Cart */}
                <div className="modal-purchase-controls">
                  <div className="qty-picker">
                    <button 
                      className="qty-btn" 
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <span className="qty-value">{quantity}</span>
                    <button 
                      className="qty-btn" 
                      onClick={() => setQuantity(prev => prev + 1)}
                    >
                      +
                    </button>
                  </div>

                  <button className="modal-add-cart-btn" onClick={handleModalAddToCart}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z"/>
                    </svg>
                    ADD TO CART
                  </button>
                </div>

                <div className="modal-meta-list">
                  <div className="meta-item"><span>SKU:</span> ONION-{quickViewProduct.id.toString().padStart(3, '0')}</div>
                  <div className="meta-item"><span>Farm Origin:</span> 100% Certified Nashik Agricultural Produce</div>
                  <div className="meta-item"><span>Delivery:</span> Same-Day / Next-Day Express Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="toast-notification">
          <div className="toast-content">
            <span className="toast-dot"></span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </section>
  )
}
