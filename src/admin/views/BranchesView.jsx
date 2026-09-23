import React, { useState } from 'react'

export default function BranchesView({ store, onSave }) {
  const [editingBranch, setEditingBranch] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    type: '',
    address: '',
    phone: '',
    email: '',
    hours: '',
    manager: '',
    coverage: '',
    active: true
  })

  const openEditModal = (branch) => {
    setEditingBranch(branch)
    setFormData({
      name: branch.name,
      city: branch.city,
      type: branch.type || 'Regional Hub',
      address: branch.address,
      phone: branch.phone,
      email: branch.email,
      hours: branch.hours,
      manager: branch.manager || '',
      coverage: branch.coverage || '',
      active: branch.active !== false
    })
    setIsModalOpen(true)
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    if (!editingBranch) return

    const updatedBranches = store.branches.map(b => {
      if (b.id === editingBranch.id) {
        return {
          ...b,
          ...formData
        }
      }
      return b
    })

    onSave({ ...store, branches: updatedBranches })
    setIsModalOpen(false)
  }

  return (
    <div className="admin-branches-view">
      
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Punjab Regional Branches & Hub Contact Details</h3>
            <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>
              Update direct phone numbers, email inboxes, addresses, and operating hours across Amritsar, Jalandhar, Batala, and Gurdaspur.
            </p>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Branch / City</th>
                <th>Type / Role</th>
                <th>Direct Phone</th>
                <th>Email Inbox</th>
                <th>Physical Address</th>
                <th>Daily Timings</th>
                <th>Hub Manager</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {store.branches.map((b) => (
                <tr key={b.id}>
                  <td>
                    <strong>{b.name}</strong>
                    <div style={{ fontSize: '11.5px', color: '#777' }}>📍 {b.city}</div>
                  </td>
                  <td>
                    <span className="topbar-badge hub-badge" style={{ padding: '2px 8px', fontSize: '11px' }}>
                      {b.type}
                    </span>
                  </td>
                  <td>
                    <a href={`tel:${b.phone}`} style={{ color: '#74114e', fontWeight: 700 }}>
                      {b.phone}
                    </a>
                  </td>
                  <td>
                    <a href={`mailto:${b.email}`} style={{ color: '#444' }}>
                      {b.email}
                    </a>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: '#555', maxWidth: '240px', display: 'inline-block' }}>
                      {b.address}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{b.hours}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12.5px' }}>{b.manager || 'Assigned Manager'}</span>
                  </td>
                  <td>
                    <button className="table-icon-btn edit" onClick={() => openEditModal(b)}>
                      Edit Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Branch Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>Edit Contact Details: {editingBranch?.name}</h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Branch Hub Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>City / District *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Direct Contact Phone *</label>
                    <input 
                      type="tel" 
                      required 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Official Email Address *</label>
                    <input 
                      type="email" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. amritsar@theonionstore.in"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Full Depot Address / Landmark *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Operating Hours *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.hours}
                      onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                      placeholder="e.g. 7:00 AM – 9:30 PM (Daily)"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Branch Manager Name</label>
                    <input 
                      type="text" 
                      value={formData.manager}
                      onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Express Delivery Coverage Areas</label>
                  <input 
                    type="text" 
                    value={formData.coverage}
                    onChange={(e) => setFormData({ ...formData, coverage: e.target.value })}
                    placeholder="e.g. Amritsar City, Majitha, Jandiala Guru"
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn primary">
                  Save Branch Contacts
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
