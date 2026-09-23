import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getAdminStore, saveAdminStore, getAuthUser, logoutUser } from './adminStore'
import AdminLogin from './AdminLogin'
import AdminSidebar from './AdminSidebar'
import { 
  getRecentNotifications, 
  markAllNotificationsAsRead, 
  clearNotificationHistory, 
  isSoundEnabled, 
  setSoundEnabled, 
  getNotificationPermission, 
  requestNotificationPermission, 
  triggerTestOrder 
} from '../notificationService'

// Views
import OverviewView from './views/OverviewView'
import BranchAccountsView from './views/BranchAccountsView'
import ProductsView from './views/ProductsView'
import BannersView from './views/BannersView'
import BranchesView from './views/BranchesView'
import BlogsView from './views/BlogsView'
import FaqView from './views/FaqView'
import BranchStockView from './views/BranchStockView'
import BranchOrdersView from './views/BranchOrdersView'
import StoreSettingsView from './views/StoreSettingsView'
import PaymentScannerView from './views/PaymentScannerView'

import './AdminPortal.css'

export default function AdminPortal() {
  const [user, setUser] = useState(getAuthUser())
  const [store, setStore] = useState(getAdminStore())
  const [currentView, setCurrentView] = useState('overview')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Order Notifications state
  const [notifications, setNotifications] = useState(getRecentNotifications())
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false)
  const [soundActive, setSoundActive] = useState(isSoundEnabled())
  const [pushStatus, setPushStatus] = useState(getNotificationPermission())
  const notifDropdownRef = useRef(null)

  // Sync state if changed elsewhere
  useEffect(() => {
    const handleStoreUpdate = () => {
      setStore(getAdminStore())
    }
    const handleAuthUpdate = () => {
      setUser(getAuthUser())
    }

    const handleSyncError = (e) => {
      const msg = e.detail || 'Could not sync to cloud. Please check Firestore Rules.'
      showToast(`⚠️ Sync Error: ${msg}`)
    }

    const handleNotifHistoryUpdate = (e) => {
      setNotifications(e.detail || getRecentNotifications())
    }

    const handleSoundChange = (e) => {
      setSoundActive(e.detail)
    }

    const handleOpenOrder = () => {
      setCurrentView('branch-orders')
    }

    window.addEventListener('admin_store_updated', handleStoreUpdate)
    window.addEventListener('admin_auth_changed', handleAuthUpdate)
    window.addEventListener('admin_sync_error', handleSyncError)
    window.addEventListener('onion_notification_history_updated', handleNotifHistoryUpdate)
    window.addEventListener('onion_sound_preference_changed', handleSoundChange)
    window.addEventListener('onion_open_order_details', handleOpenOrder)

    return () => {
      window.removeEventListener('admin_store_updated', handleStoreUpdate)
      window.removeEventListener('admin_auth_changed', handleAuthUpdate)
      window.removeEventListener('admin_sync_error', handleSyncError)
      window.removeEventListener('onion_notification_history_updated', handleNotifHistoryUpdate)
      window.removeEventListener('onion_sound_preference_changed', handleSoundChange)
      window.removeEventListener('onion_open_order_details', handleOpenOrder)
    }
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setIsNotifDropdownOpen(false)
      }
    }
    if (isNotifDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isNotifDropdownOpen])

  const handleToggleSound = () => {
    const next = !soundActive
    setSoundEnabled(next)
    setSoundActive(next)
    showToast(`Order sound alert turned ${next ? 'ON 🔊' : 'OFF 🔇'}`)
  }

  const handleRequestPush = async () => {
    const res = await requestNotificationPermission()
    setPushStatus(res)
    if (res === 'granted') {
      showToast('Desktop push notifications enabled! 🔔')
    } else {
      showToast('Push permission denied or not granted.')
    }
  }

  const handleTestNotification = () => {
    triggerTestOrder()
    showToast('🧪 Test order notification triggered!')
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage('')
    }, 3500)
  }

  const handleSaveStore = (newStoreData) => {
    saveAdminStore(newStoreData)
    setStore(newStoreData)
    showToast('Changes saved and synced across live storefront!')
  }

  const handleLogout = () => {
    logoutUser()
    setUser(null)
  }

  // If not logged in, render login screen
  if (!user) {
    return <AdminLogin onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />
  }

  const isSuperAdmin = user.role === 'admin'

  return (
    <div className="admin-app-layout">
      
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div 
          className="admin-floating-toast"
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 99999,
            background: '#15803d',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
            fontSize: '13.5px',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <span>✓</span> {toastMessage}
        </div>
      )}

      {/* Sidebar Navigation */}
      <AdminSidebar 
        currentView={currentView}
        onNavigate={(viewId) => setCurrentView(viewId)}
        user={user}
        onLogout={handleLogout}
        onChangePassword={() => setIsChangePasswordOpen(true)}
        isOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        store={store}
      />

      {/* Main Content Wrapper */}
      <div className="admin-main-wrapper">
        
        {/* Top Navbar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <button 
              className="admin-mob-toggle"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              aria-label="Toggle menu"
            >
              ☰
            </button>
            <h1 className="topbar-title">
              {currentView === 'overview' && 'Dashboard Overview'}
              {currentView === 'products' && 'Products & Pack Pricing'}
              {currentView === 'branch-accounts' && 'Branch Member Accounts'}
              {currentView === 'banners' && 'Hero Slider Banners'}
              {currentView === 'branches' && 'Punjab Regional Branches'}
              {currentView === 'blogs' && 'Farming Journal & Blogs'}
              {currentView === 'faq' && 'FAQ Management'}
              {currentView === 'store-settings' && 'Store Settings, Theme & Customization'}
              {currentView === 'payment-scanner' && `${isSuperAdmin ? 'Storefront & Hubs' : user.branchName} G-Pay & UPI Scanner`}
              {currentView === 'branch-stock' && `${isSuperAdmin ? 'Punjab Hubs' : user.branchName} Bulk Stock & Inventory (KG)`}
              {currentView === 'branch-orders' && `${isSuperAdmin ? 'All Punjab' : user.branchName} Orders`}
            </h1>
          </div>

          <div className="topbar-right">
            {/* Order Notifications Bell & Dropdown */}
            <div className="admin-notif-container" ref={notifDropdownRef}>
              <button 
                type="button" 
                className={`admin-notif-btn ${isNotifDropdownOpen ? 'active' : ''}`}
                onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                title="Order Notifications"
                aria-label="Order Notifications"
              >
                <span>🔔</span>
                {unreadCount > 0 && (
                  <span className="admin-notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
              </button>

              {isNotifDropdownOpen && (
                <div className="admin-notif-dropdown">
                  <div className="admin-notif-dropdown-header">
                    <h4 className="admin-notif-dropdown-title">
                      <span>🔔</span> Order Notifications ({notifications.length})
                    </h4>
                    <div className="admin-notif-header-actions">
                      {unreadCount > 0 && (
                        <button 
                          type="button" 
                          className="admin-notif-header-btn" 
                          onClick={() => markAllNotificationsAsRead()}
                        >
                          Mark all read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button 
                          type="button" 
                          className="admin-notif-header-btn" 
                          onClick={() => clearNotificationHistory()}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quick Controls */}
                  <div className="admin-notif-controls-bar">
                    <button 
                      type="button" 
                      className={`admin-notif-toggle-btn ${soundActive ? 'active' : ''}`}
                      onClick={handleToggleSound}
                      title="Toggle Audio Alert on New Orders"
                    >
                      <span>{soundActive ? '🔊' : '🔇'}</span>
                      <span>Sound: {soundActive ? 'ON' : 'OFF'}</span>
                    </button>

                    {pushStatus !== 'granted' && (
                      <button 
                        type="button" 
                        className="admin-notif-toggle-btn"
                        onClick={handleRequestPush}
                        title="Enable Desktop Push Notifications"
                      >
                        <span>📱</span>
                        <span>Enable Push</span>
                      </button>
                    )}

                    <button 
                      type="button" 
                      className="admin-notif-toggle-btn"
                      onClick={handleTestNotification}
                      title="Send Test Order Alert"
                    >
                      <span>🧪</span>
                      <span>Test Alert</span>
                    </button>
                  </div>

                  {/* Notification Items List */}
                  <div className="admin-notif-list">
                    {notifications.length === 0 ? (
                      <div className="admin-notif-empty">
                        <span className="admin-notif-empty-icon">📭</span>
                        <p style={{ margin: 0, fontSize: '12.5px', fontWeight: 600 }}>No recent order alerts</p>
                        <span style={{ fontSize: '11px', color: '#999' }}>Incoming customer orders will appear here in real-time</span>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`admin-notif-item ${!n.isRead ? 'unread' : ''}`}
                          onClick={() => {
                            markAllNotificationsAsRead()
                            setCurrentView('branch-orders')
                            setIsNotifDropdownOpen(false)
                          }}
                        >
                          <div className="admin-notif-item-top">
                            <span className="admin-notif-item-id">#{n.orderId} {n.isTest ? '(Test)' : ''}</span>
                            <span className="admin-notif-item-time">
                              {n.receivedAt ? new Date(n.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                            </span>
                          </div>
                          <div className="admin-notif-item-desc">
                            <span>{n.customerName}</span>
                            <span style={{ color: '#0a6637', fontWeight: 800 }}>₹{Number(n.totalAmount || 0).toFixed(2)}</span>
                          </div>
                          <div className="admin-notif-item-sub">
                            <span>📦 {n.packSize}</span>
                            <span>&bull;</span>
                            <span>📍 {n.branchId ? n.branchId.toUpperCase() : 'Hub'}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="admin-notif-dropdown-footer">
                      <button 
                        type="button" 
                        style={{ width: '100%', padding: '7px', background: '#74114e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                        onClick={() => {
                          setCurrentView('branch-orders')
                          setIsNotifDropdownOpen(false)
                        }}
                      >
                        Go to Orders Table &rarr;
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button 
              type="button" 
              onClick={() => setIsChangePasswordOpen(true)}
              title="Change Account Password"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#f4f0f4',
                color: '#74114e',
                border: '1px solid #ebd0e2',
                padding: '6px 12px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <span>🔑</span>
              <span>Change Password</span>
            </button>

            {isSuperAdmin && (
              <button 
                type="button" 
                onClick={() => setCurrentView('store-settings')}
                title="Store Settings & Theme Customization"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: currentView === 'store-settings' ? '#74114e' : '#f4f0f4',
                  color: currentView === 'store-settings' ? '#ffffff' : '#74114e',
                  border: '1px solid #ebd0e2',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>⚙️</span>
                <span>Settings</span>
              </button>
            )}
            <span className="topbar-badge hub-badge">
              📍 {isSuperAdmin ? 'Punjab Super Hub (All)' : user.branchName}
            </span>
            <Link to="/" className="admin-view-store-link" target="_blank" rel="noopener noreferrer">
              View Storefront ↗
            </Link>
          </div>
        </header>

        {/* Dynamic Body View */}
        <div className="admin-view-body">
          {currentView === 'overview' && (
            <OverviewView store={store} user={user} onNavigate={setCurrentView} />
          )}

          {currentView === 'branch-accounts' && isSuperAdmin && (
            <BranchAccountsView store={store} onSave={handleSaveStore} />
          )}

          {currentView === 'products' && isSuperAdmin && (
            <ProductsView store={store} onSave={handleSaveStore} />
          )}

          {currentView === 'banners' && isSuperAdmin && (
            <BannersView store={store} onSave={handleSaveStore} />
          )}

          {currentView === 'branches' && isSuperAdmin && (
            <BranchesView store={store} onSave={handleSaveStore} />
          )}

          {currentView === 'blogs' && isSuperAdmin && (
            <BlogsView store={store} onSave={handleSaveStore} />
          )}

          {currentView === 'faq' && isSuperAdmin && (
            <FaqView store={store} onSave={handleSaveStore} />
          )}

          {currentView === 'store-settings' && isSuperAdmin && (
            <StoreSettingsView store={store} onSave={handleSaveStore} />
          )}

          {currentView === 'payment-scanner' && (
            <PaymentScannerView store={store} user={user} onSave={handleSaveStore} />
          )}

          {currentView === 'branch-stock' && (
            <BranchStockView store={store} user={user} onSave={handleSaveStore} />
          )}

          {currentView === 'branch-orders' && (
            <BranchOrdersView store={store} user={user} onSave={handleSaveStore} />
          )}
        </div>

      </div>

      {/* Self-Service Change Password Modal */}
      {isChangePasswordOpen && (
        <ChangePasswordModal
          user={user}
          store={store}
          onClose={() => setIsChangePasswordOpen(false)}
          onSuccess={(updatedStore) => {
            handleSaveStore(updatedStore)
            setIsChangePasswordOpen(false)
            showToast('✅ Password changed successfully and synced!')
          }}
        />
      )}

    </div>
  )
}

function ChangePasswordModal({ user, store, onClose, onSuccess }) {
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const users = store.users || []
    const currentUserIndex = users.findIndex(u => u.id === user.id || u.username === user.username)

    if (currentUserIndex === -1) {
      setError('User account not found in database.')
      return
    }

    const dbUser = users[currentUserIndex]

    if (dbUser.password !== currentPass.trim()) {
      setError('Current password does not match.')
      return
    }

    if (newPass.length < 3) {
      setError('New password must be at least 3 characters long.')
      return
    }

    if (newPass !== confirmPass) {
      setError('New password and confirmation do not match.')
      return
    }

    const updatedUsers = [...users]
    updatedUsers[currentUserIndex] = {
      ...dbUser,
      password: newPass.trim()
    }

    onSuccess({
      ...store,
      users: updatedUsers
    })
  }

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-card" style={{ maxWidth: '440px', width: '95%' }}>
        <div className="admin-modal-header">
          <h3>🔑 Change Account Password</h3>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            <div style={{ background: '#faf4f8', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: '#555' }}>
              Logged in as: <strong style={{ color: '#74114e' }}>{user.name}</strong> (<code>{user.username}</code>)
            </div>

            {error && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '8px', fontSize: '12.5px', marginBottom: '14px', fontWeight: 600 }}>
                ⚠️ {error}
              </div>
            )}

            <div className="admin-form-group">
              <label>Current Password *</label>
              <input 
                type={showPass ? 'text' : 'password'} 
                required 
                placeholder="Enter current password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                autoFocus
              />
            </div>

            <div className="admin-form-group">
              <label>New Password *</label>
              <input 
                type={showPass ? 'text' : 'password'} 
                required 
                placeholder="Enter new password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label>Confirm New Password *</label>
              <input 
                type={showPass ? 'text' : 'password'} 
                required 
                placeholder="Re-type new password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <input 
                type="checkbox" 
                id="show-pass-toggle" 
                checked={showPass} 
                onChange={(e) => setShowPass(e.target.checked)} 
              />
              <label htmlFor="show-pass-toggle" style={{ fontSize: '12px', color: '#666', cursor: 'pointer', margin: 0 }}>
                Show Passwords
              </label>
            </div>
          </div>

          <div className="admin-modal-footer">
            <button type="button" className="admin-btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-btn primary">
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
