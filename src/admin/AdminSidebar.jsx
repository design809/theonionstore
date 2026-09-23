import React from 'react'
import { Link } from 'react-router-dom'
import logoImg from '../assets/logo.png'

export default function AdminSidebar({
  currentView,
  onNavigate,
  user,
  onLogout,
  onChangePassword,
  isOpen,
  onCloseMobile,
  store
}) {
  const isSuperAdmin = user.role === 'admin'
  const settings = store?.settings || {}
  const logoSrc = settings.customLogoUrl || logoImg
  const siteTitle = settings.siteTitle || 'The Onion Store'

  // Count pending orders for badge
  const pendingOrdersCount = store.orders.filter(o => {
    if (!isSuperAdmin && o.branchId !== user.branchId) return false
    return o.status === 'Pending' || o.status === 'Confirmed'
  }).length

  const handleNav = (viewId) => {
    onNavigate(viewId)
    if (onCloseMobile) onCloseMobile()
  }

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      
      {/* Brand Header */}
      <div className="admin-sidebar-header">
        <img src={logoSrc} alt={siteTitle} className="admin-sidebar-logo" />
        <div className="admin-sidebar-brand">
          <h3>{siteTitle}</h3>
          <span>{isSuperAdmin ? 'Admin Control' : 'Branch Portal'}</span>
        </div>
      </div>

      {/* User Profile Info */}
      <div className="admin-user-profile-badge">
        <div className={`user-avatar ${user.role}`}>
          {isSuperAdmin ? '👑' : '📍'}
        </div>
        <div className="user-info">
          <span className="user-name">{user.name}</span>
          <span className={`user-role-tag ${user.role}`}>
            {isSuperAdmin ? 'Super Admin' : user.branchName || 'Branch Manager'}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <ul className="admin-nav-list">
        
        <li className="admin-nav-section-title">CORE NAVIGATION</li>

        {/* 1. Overview */}
        <li className={`admin-nav-item ${currentView === 'overview' ? 'active' : ''}`}>
          <button type="button" onClick={() => handleNav('overview')}>
            <span className="admin-nav-icon">📊</span>
            <span>Dashboard Overview</span>
          </button>
        </li>

        {/* Branch Member Specific Actions */}
        <li className={`admin-nav-item ${currentView === 'branch-orders' ? 'active' : ''}`}>
          <button type="button" onClick={() => handleNav('branch-orders')}>
            <span className="admin-nav-icon">🚚</span>
            <span>{isSuperAdmin ? 'All Customer Orders' : 'Branch Orders'}</span>
            {pendingOrdersCount > 0 && (
              <span className="nav-badge-count">{pendingOrdersCount}</span>
            )}
          </button>
        </li>

        <li className={`admin-nav-item ${currentView === 'branch-stock' ? 'active' : ''}`}>
          <button type="button" onClick={() => handleNav('branch-stock')}>
            <span className="admin-nav-icon">📦</span>
            <span>{isSuperAdmin ? 'Warehouse Stocks (KG)' : 'Branch Stock (KG)'}</span>
          </button>
        </li>

        {/* G-Pay & UPI Payment Scanner Setting for Admin & Branch Members */}
        <li className={`admin-nav-item ${currentView === 'payment-scanner' ? 'active' : ''}`}>
          <button type="button" onClick={() => handleNav('payment-scanner')}>
            <span className="admin-nav-icon">💳</span>
            <span>G-Pay & QR Scanner</span>
          </button>
        </li>

        {/* Super Admin Management Controls */}
        {isSuperAdmin && (
          <>
            <li className="admin-nav-section-title">STOREFRONT CONFIG</li>

            <li className={`admin-nav-item ${currentView === 'products' ? 'active' : ''}`}>
              <button type="button" onClick={() => handleNav('products')}>
                <span className="admin-nav-icon">🧅</span>
                <span>Products & Pack Prices</span>
              </button>
            </li>

            <li className={`admin-nav-item ${currentView === 'branch-accounts' ? 'active' : ''}`}>
              <button type="button" onClick={() => handleNav('branch-accounts')}>
                <span className="admin-nav-icon">👥</span>
                <span>Branch Accounts</span>
              </button>
            </li>

            <li className={`admin-nav-item ${currentView === 'banners' ? 'active' : ''}`}>
              <button type="button" onClick={() => handleNav('banners')}>
                <span className="admin-nav-icon">🖼️</span>
                <span>Hero Slider Banners</span>
              </button>
            </li>

            <li className={`admin-nav-item ${currentView === 'branches' ? 'active' : ''}`}>
              <button type="button" onClick={() => handleNav('branches')}>
                <span className="admin-nav-icon">🏛️</span>
                <span>Branch Hub Contacts</span>
              </button>
            </li>

            <li className={`admin-nav-item ${currentView === 'blogs' ? 'active' : ''}`}>
              <button type="button" onClick={() => handleNav('blogs')}>
                <span className="admin-nav-icon">✍️</span>
                <span>Farming Blogs & Tips</span>
              </button>
            </li>

            <li className={`admin-nav-item ${currentView === 'faq' ? 'active' : ''}`}>
              <button type="button" onClick={() => handleNav('faq')}>
                <span className="admin-nav-icon">❓</span>
                <span>FAQ Manager</span>
              </button>
            </li>

            <li className={`admin-nav-item ${currentView === 'store-settings' ? 'active' : ''}`}>
              <button type="button" onClick={() => handleNav('store-settings')}>
                <span className="admin-nav-icon">⚙️</span>
                <span>Store Theme & Settings</span>
              </button>
            </li>
          </>
        )}

      </ul>

      {/* Footer Actions */}
      <div className="admin-sidebar-footer">
        <button 
          type="button" 
          className="admin-sidebar-btn" 
          onClick={onChangePassword}
          style={{ background: '#f5eef4', color: '#74114e', border: '1px solid #ebd0e2', fontWeight: 600 }}
        >
          🔑 Change Password
        </button>
        <Link to="/" className="admin-sidebar-btn store-btn">
          🌐 View Live Storefront
        </Link>
        <button type="button" className="admin-sidebar-btn logout-btn" onClick={onLogout}>
          🚪 Sign Out ({user.username})
        </button>
      </div>

    </aside>
  )
}
