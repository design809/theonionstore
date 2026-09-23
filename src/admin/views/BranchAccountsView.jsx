import React, { useState } from 'react'

export default function BranchAccountsView({ store, onSave }) {
  const [editingUser, setEditingUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'branch',
    branchId: 'amritsar',
    branchName: 'Amritsar Central Hub',
    email: '',
    phone: '',
    status: 'active'
  })

  const openCreateModal = () => {
    setEditingUser(null)
    setFormData({
      username: '',
      password: '123',
      name: '',
      role: 'branch',
      branchId: 'amritsar',
      branchName: 'Amritsar Central Hub',
      email: '',
      phone: '',
      status: 'active'
    })
    setIsModalOpen(true)
  }

  const openEditModal = (user) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      password: user.password,
      name: user.name,
      role: user.role,
      branchId: user.branchId,
      branchName: user.branchName,
      email: user.email || '',
      phone: user.phone || '',
      status: user.status
    })
    setIsModalOpen(true)
  }

  const handleBranchChange = (branchId) => {
    const matched = store.branches.find(b => b.id === branchId)
    setFormData({
      ...formData,
      branchId: branchId,
      branchName: matched ? matched.name : branchId.toUpperCase()
    })
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    if (!formData.username || !formData.password) return

    const updatedUsers = [...store.users]

    if (editingUser) {
      // Edit
      const idx = updatedUsers.findIndex(u => u.id === editingUser.id)
      if (idx !== -1) {
        updatedUsers[idx] = {
          ...updatedUsers[idx],
          ...formData
        }
      }
    } else {
      // Create
      const newUser = {
        id: `usr_${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
        ...formData
      }
      updatedUsers.push(newUser)
    }

    onSave({ ...store, users: updatedUsers })
    setIsModalOpen(false)
  }

  const handleDeleteUser = (userId) => {
    if (userId === 'usr_admin') {
      alert('Cannot delete super admin account!')
      return
    }
    if (window.confirm('Are you sure you want to delete this branch account?')) {
      const updatedUsers = store.users.filter(u => u.id !== userId)
      onSave({ ...store, users: updatedUsers })
    }
  }

  const handleToggleStatus = (user) => {
    if (user.id === 'usr_admin') return
    const updatedUsers = store.users.map(u => {
      if (u.id === user.id) {
        return { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
      }
      return u
    })
    onSave({ ...store, users: updatedUsers })
  }

  return (
    <div className="admin-branch-accounts-view">
      
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Branch Member Accounts & Logins</h3>
            <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>
              Create, edit, and assign login accounts for regional Punjab branch managers.
            </p>
          </div>
          <button className="admin-btn primary" onClick={openCreateModal}>
            + Create New Branch Account
          </button>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Manager Name</th>
                <th>Role</th>
                <th>Assigned Branch</th>
                <th>Contact Info</th>
                <th>Password</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {store.users.map((u) => (
                <tr key={u.id}>
                  <td><strong>@{u.username}</strong></td>
                  <td>{u.name}</td>
                  <td>
                    <span className={`user-role-tag ${u.role}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className="topbar-badge hub-badge" style={{ padding: '3px 8px', fontSize: '11.5px' }}>
                      {u.branchName || u.branchId.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px' }}>
                      <div>{u.phone}</div>
                      <div style={{ color: '#777' }}>{u.email}</div>
                    </div>
                  </td>
                  <td>
                    <code style={{ background: '#f5e8f1', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>
                      {u.password}
                    </code>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleToggleStatus(u)}
                      className={`status-pill ${u.status}`}
                      style={{ border: 'none', cursor: u.id === 'usr_admin' ? 'default' : 'pointer' }}
                      title="Click to toggle status"
                    >
                      {u.status}
                    </button>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="table-icon-btn edit" onClick={() => openEditModal(u)}>
                        Edit
                      </button>
                      {u.id !== 'usr_admin' && (
                        <button className="table-icon-btn delete" onClick={() => handleDeleteUser(u.id)}>
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Popup */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>{editingUser ? `Edit Account: @${editingUser.username}` : 'Create New Branch Account'}</h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Username *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="e.g. amritsar_hub"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Password *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="e.g. 123"
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Manager / Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. S. Harpreet Singh"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Assigned Branch Location *</label>
                    <select 
                      value={formData.branchId}
                      onChange={(e) => handleBranchChange(e.target.value)}
                    >
                      {store.branches.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.city})
                        </option>
                      ))}
                      {editingUser?.role === 'admin' && (
                        <option value="all">Headquarters (All Hubs)</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Contact Phone</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. manager@theonionstore.in"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Account Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active (Can Login & Manage Branch)</option>
                    <option value="inactive">Inactive / Disabled</option>
                  </select>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn primary">
                  {editingUser ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
