import React from 'react'

export default function OverviewView({ store, user, onNavigate }) {
  const isSuperAdmin = user.role === 'admin'
  const currentBranchId = user.branchId

  // Calculate high-level metrics
  const totalProducts = store.products.length
  const totalBranches = store.branches.length
  
  // Filter orders by branch if branch member
  const visibleOrders = isSuperAdmin 
    ? store.orders 
    : store.orders.filter(o => o.branchId === currentBranchId)

  const totalRevenue = visibleOrders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0)
  const pendingOrders = visibleOrders.filter(o => o.status === 'Pending' || o.status === 'Confirmed').length
  const deliveredOrders = visibleOrders.filter(o => o.status === 'Delivered').length

  // Calculate total stock in KG
  let totalStockKg = 0
  if (isSuperAdmin) {
    (store.branches || []).forEach(b => totalStockKg += (b.totalStockKg || 0))
  } else {
    const br = (store.branches || []).find(b => b.id === currentBranchId)
    totalStockKg = br ? (br.totalStockKg || 0) : 0
  }

  return (
    <div className="admin-overview-view">
      
      {/* 1. Stat KPI Cards */}
      <div className="admin-stats-grid">
        
        {/* Total Orders */}
        <div className="admin-stat-card">
          <div className="stat-icon-wrap purple">📦</div>
          <div className="stat-info">
            <span className="stat-label">Total Orders</span>
            <span className="stat-number">{visibleOrders.length}</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="admin-stat-card">
          <div className="stat-icon-wrap green">₹</div>
          <div className="stat-info">
            <span className="stat-label">Gross Value</span>
            <span className="stat-number">₹{totalRevenue.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Pending / Active Dispatches */}
        <div className="admin-stat-card">
          <div className="stat-icon-wrap amber">⏳</div>
          <div className="stat-info">
            <span className="stat-label">Active Dispatches</span>
            <span className="stat-number">{pendingOrders}</span>
          </div>
        </div>

        {/* Available Stock */}
        <div className="admin-stat-card">
          <div className="stat-icon-wrap blue">🧅</div>
          <div className="stat-info">
            <span className="stat-label">{isSuperAdmin ? 'Total Punjab Stock' : 'Branch Stock'}</span>
            <span className="stat-number">{totalStockKg.toLocaleString('en-IN')} kg</span>
          </div>
        </div>

      </div>

      {/* 2. Quick Action / Role Helper Banner */}
      <div className="admin-card" style={{ background: 'linear-gradient(135deg, #fdf8fb 0%, #f7ebf3 100%)', borderColor: '#ebd0e2' }}>
        <div className="admin-card-header" style={{ marginBottom: '8px' }}>
          <h3 className="admin-card-title">
            {isSuperAdmin ? '👑 Super Admin Control Center' : `📍 ${user.branchName} Portal`}
          </h3>
          <span className="status-pill active">{user.role.toUpperCase()} ACCESS</span>
        </div>
        <p style={{ fontSize: '13px', color: '#666', margin: '0 0 16px 0', lineHeight: 1.5 }}>
          {isSuperAdmin 
            ? 'You have complete administrative access over Branch Accounts, Pack Pricing, Main Hero Banners, Branch Contacts, Blogs, and FAQs.' 
            : `Welcome back, ${user.name}! Manage your branch stock inventories, dispatch customer orders, and update delivery statuses.`}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {isSuperAdmin ? (
            <>
              <button className="admin-btn primary" onClick={() => onNavigate('products')}>
                Manage Products & Prices
              </button>
              <button className="admin-btn secondary" onClick={() => onNavigate('branch-accounts')}>
                Manage Branch Accounts
              </button>
              <button className="admin-btn secondary" onClick={() => onNavigate('banners')}>
                Edit Hero Banners
              </button>
              <button className="admin-btn secondary" onClick={() => onNavigate('branches')}>
                Update Hub Contacts
              </button>
            </>
          ) : (
            <>
              <button className="admin-btn primary" onClick={() => onNavigate('branch-orders')}>
                View Branch Orders ({pendingOrders} pending)
              </button>
              <button className="admin-btn secondary" onClick={() => onNavigate('branch-stock')}>
                Update Branch Stock
              </button>
            </>
          )}
        </div>
      </div>

      {/* 3. Recent Orders Overview Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            Recent {isSuperAdmin ? 'Punjab Hub' : user.branchName} Orders
          </h3>
          <button 
            className="admin-btn secondary"
            onClick={() => onNavigate(isSuperAdmin ? 'branch-orders' : 'branch-orders')}
          >
            View All ({visibleOrders.length}) &rarr;
          </button>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Branch Hub</th>
                <th>Pack Details</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.slice(0, 5).map((order) => (
                <tr key={order.id}>
                  <td><strong>{order.id}</strong></td>
                  <td>{order.date}</td>
                  <td>{order.customerName}</td>
                  <td><a href={`tel:${order.customerPhone}`} style={{ color: '#74114e', fontWeight: 600 }}>{order.customerPhone}</a></td>
                  <td><span className="topbar-badge hub-badge" style={{ padding: '2px 8px', fontSize: '11px' }}>{order.branchId.toUpperCase()}</span></td>
                  <td>{order.quantity}x {order.packSize}</td>
                  <td><strong>₹{order.totalAmount?.toFixed(2)}</strong></td>
                  <td>
                    <span className={`status-pill ${order.status.toLowerCase().replace(/\s+/g, '_')}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
