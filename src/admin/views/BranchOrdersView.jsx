import React, { useState } from 'react'
import { triggerOrderNotification, markOrderAsSeen } from '../../notificationService'

export default function BranchOrdersView({ store, user, onSave }) {
  const isSuperAdmin = user.role === 'admin'
  const [selectedBranchFilter, setSelectedBranchFilter] = useState(
    isSuperAdmin ? 'all' : user.branchId
  )
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingOrder, setEditingOrder] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newOrderForm, setNewOrderForm] = useState({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    branchId: isSuperAdmin ? 'amritsar' : user.branchId,
    packSize: '5kg Sack',
    quantity: 1,
    totalAmount: 175.00,
    paymentMethod: 'Cash on Delivery (COD)',
    status: 'Confirmed',
    notes: ''
  })

  // Filter orders
  const filteredOrders = store.orders.filter(order => {
    // Branch Filter
    if (!isSuperAdmin && order.branchId !== user.branchId) return false
    if (isSuperAdmin && selectedBranchFilter !== 'all' && order.branchId !== selectedBranchFilter) return false

    // Status Filter
    if (statusFilter !== 'all' && order.status !== statusFilter) return false

    return true
  })

  const handleStatusChange = (orderId, nextStatus) => {
    const updatedOrders = store.orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: nextStatus }
      }
      return o
    })
    onSave({ ...store, orders: updatedOrders })
  }

  const handleDeleteOrder = (orderId) => {
    if (window.confirm('Are you sure you want to delete this order record?')) {
      const updatedOrders = store.orders.filter(o => o.id !== orderId)
      onSave({ ...store, orders: updatedOrders })
    }
  }

  const handleCreateOrder = (e) => {
    e.preventDefault()
    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      ...newOrderForm,
      quantity: Number(newOrderForm.quantity),
      totalAmount: Number(newOrderForm.totalAmount)
    }

    markOrderAsSeen(newOrder.id)
    onSave({ ...store, orders: [newOrder, ...store.orders] })
    triggerOrderNotification(newOrder)
    setIsCreateModalOpen(false)
    setNewOrderForm({
      customerName: '',
      customerPhone: '',
      deliveryAddress: '',
      branchId: isSuperAdmin ? 'amritsar' : user.branchId,
      packSize: '5kg Sack',
      quantity: 1,
      totalAmount: 175.00,
      paymentMethod: 'Cash on Delivery (COD)',
      status: 'Confirmed',
      notes: ''
    })
  }

  return (
    <div className="admin-branch-orders-view">
      
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">
              🚚 {isSuperAdmin ? 'All Punjab Customer Orders' : `${user.branchName} Dispatches`}
            </h3>
            <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>
              Manage customer doorstep dispatches, commercial bulk supply bookings, and real-time delivery status.
            </p>
          </div>

          <button className="admin-btn primary" onClick={() => setIsCreateModalOpen(true)}>
            + Create New Order / Booking
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
          
          {isSuperAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#555' }}>Branch:</span>
              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #ebd0e2', fontSize: '12.5px' }}
              >
                <option value="all">All Punjab Hubs ({store.orders.length})</option>
                {store.branches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#555' }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #ebd0e2', fontSize: '12.5px' }}
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#666', fontWeight: 600 }}>
            Showing {filteredOrders.length} order{filteredOrders.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Orders Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date & Time</th>
                <th>Customer & Phone</th>
                <th>Delivery Address</th>
                <th>Branch Hub</th>
                <th>Pack Details</th>
                <th>Total (₹)</th>
                <th>Delivery Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
                    No orders matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong style={{ color: '#74114e' }}>{order.id}</strong>
                    </td>
                    <td><span style={{ fontSize: '12px', color: '#666' }}>{order.date}</span></td>
                    <td>
                      <strong>{order.customerName}</strong>
                      <div>
                        <a href={`tel:${order.customerPhone}`} style={{ color: '#74114e', fontSize: '12px', fontWeight: 600 }}>
                          📞 {order.customerPhone}
                        </a>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', maxWidth: '200px', lineHeight: 1.35 }}>
                        {order.deliveryAddress}
                        {order.notes && (
                          <div style={{ color: '#b45309', fontSize: '11px', fontStyle: 'italic', marginTop: '2px' }}>
                            📝 Note: {order.notes}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="topbar-badge hub-badge" style={{ padding: '2px 8px', fontSize: '11px' }}>
                        {order.branchId.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12.5px', fontWeight: 600 }}>
                        {order.quantity}x {order.packSize}
                      </span>
                      <div style={{ fontSize: '11px', color: '#888' }}>{order.paymentMethod}</div>
                    </td>
                    <td>
                      <strong style={{ fontSize: '14px' }}>₹{order.totalAmount?.toFixed(2)}</strong>
                    </td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '8px',
                          border: '1px solid #d8cbd5',
                          fontSize: '12px',
                          fontWeight: 700,
                          backgroundColor: 
                            order.status === 'Delivered' ? '#dcfce7' :
                            order.status === 'Out for Delivery' ? '#fef3c7' :
                            order.status === 'Confirmed' ? '#e0f2fe' :
                            order.status === 'Cancelled' ? '#fee2e2' : '#fdfbfd'
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <button 
                        className="table-icon-btn delete" 
                        onClick={() => handleDeleteOrder(order.id)}
                        title="Delete order"
                      >
                        &times;
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Order Creation Modal */}
      {isCreateModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>Create Customer Order / Booking</h3>
              <button className="modal-close-btn" onClick={() => setIsCreateModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleCreateOrder}>
              <div className="admin-modal-body">
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Customer Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={newOrderForm.customerName}
                      onChange={(e) => setNewOrderForm({ ...newOrderForm, customerName: e.target.value })}
                      placeholder="e.g. S. Gurbaksh Singh"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Contact Phone Number *</label>
                    <input 
                      type="tel" 
                      required 
                      value={newOrderForm.customerPhone}
                      onChange={(e) => setNewOrderForm({ ...newOrderForm, customerPhone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Delivery Address *</label>
                  <input 
                    type="text" 
                    required 
                    value={newOrderForm.deliveryAddress}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, deliveryAddress: e.target.value })}
                    placeholder="House / Street, Landmark, City..."
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Assigned Branch Hub *</label>
                    <select
                      value={newOrderForm.branchId}
                      onChange={(e) => setNewOrderForm({ ...newOrderForm, branchId: e.target.value })}
                    >
                      {store.branches.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.city})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Pack Sizing</label>
                    <select
                      value={newOrderForm.packSize}
                      onChange={(e) => {
                        const pack = e.target.value
                        let estPrice = 175
                        if (pack.includes('1kg')) estPrice = 35
                        if (pack.includes('2kg')) estPrice = 70
                        if (pack.includes('3kg')) estPrice = 105
                        if (pack.includes('5kg')) estPrice = 175
                        if (pack.includes('10kg')) estPrice = 350
                        setNewOrderForm({ ...newOrderForm, packSize: pack, totalAmount: estPrice * newOrderForm.quantity })
                      }}
                    >
                      <option value="1kg Pack">1kg Household Pack (₹35)</option>
                      <option value="2kg Pack">2kg Value Pack (₹70)</option>
                      <option value="3kg Family Pack">3kg Family Pack (₹105)</option>
                      <option value="5kg Sack">5kg Kitchen Sack (₹175)</option>
                      <option value="10kg Wholesale Sack">10kg Wholesale Sack (₹350)</option>
                      <option value="25kg Commercial Sacks">25kg Commercial Bulk Supply</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Quantity of Packs *</label>
                    <input 
                      type="number" 
                      min="1"
                      required 
                      value={newOrderForm.quantity}
                      onChange={(e) => {
                        const qty = Number(e.target.value) || 1
                        const baseRate = newOrderForm.totalAmount / (newOrderForm.quantity || 1)
                        setNewOrderForm({ ...newOrderForm, quantity: qty, totalAmount: baseRate * qty })
                      }}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Total Price (₹ INR) *</label>
                    <input 
                      type="number" 
                      step="0.01"
                      required 
                      value={newOrderForm.totalAmount}
                      onChange={(e) => setNewOrderForm({ ...newOrderForm, totalAmount: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Payment Method</label>
                    <select
                      value={newOrderForm.paymentMethod}
                      onChange={(e) => setNewOrderForm({ ...newOrderForm, paymentMethod: e.target.value })}
                    >
                      <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
                      <option value="UPI Paid (GPay/PhonePe)">UPI Paid (GPay/PhonePe)</option>
                      <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Initial Status</label>
                    <select
                      value={newOrderForm.status}
                      onChange={(e) => setNewOrderForm({ ...newOrderForm, status: e.target.value })}
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="Pending">Pending</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Delivery Instructions / Special Notes</label>
                  <textarea 
                    rows="2"
                    value={newOrderForm.notes}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, notes: e.target.value })}
                    placeholder="e.g. Call customer before arrival, delivery time..."
                  ></textarea>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn secondary" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn primary">
                  Save & Dispatch Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
