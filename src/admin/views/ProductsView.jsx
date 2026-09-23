import React, { useState } from 'react'

export default function ProductsView({ store, onSave }) {
  const [editingProduct, setEditingProduct] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    weight: '1 kg',
    weightKg: 1,
    bundles: 1,
    price: 35.00,
    oldPrice: 45.00,
    discount: '22% OFF',
    status: 'in_stock',
    description: ''
  })

  const openCreateModal = () => {
    setEditingProduct(null)
    setFormData({
      name: 'Fresh Red Onions Pack',
      weight: '1 kg',
      weightKg: 1,
      bundles: 1,
      price: 35.00,
      oldPrice: 45.00,
      discount: '20% OFF',
      status: 'in_stock',
      description: 'Hand-selected farm fresh red onions.'
    })
    setIsModalOpen(true)
  }

  const openEditModal = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      weight: product.weight,
      weightKg: product.weightKg || product.bundles || 1,
      bundles: product.bundles || 1,
      price: product.price,
      oldPrice: product.oldPrice || product.price * 1.25,
      discount: product.discount || '',
      status: product.status || 'in_stock',
      description: product.description || ''
    })
    setIsModalOpen(true)
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    const updatedProducts = [...store.products]

    if (editingProduct) {
      const idx = updatedProducts.findIndex(p => p.id === editingProduct.id)
      if (idx !== -1) {
        updatedProducts[idx] = {
          ...updatedProducts[idx],
          ...formData,
          price: Number(formData.price),
          oldPrice: Number(formData.oldPrice),
          weightKg: Number(formData.weightKg),
          bundles: Number(formData.bundles)
        }
      }
    } else {
      const newProduct = {
        id: Date.now(),
        ...formData,
        price: Number(formData.price),
        oldPrice: Number(formData.oldPrice),
        weightKg: Number(formData.weightKg),
        bundles: Number(formData.bundles),
        rating: 5,
        reviewCount: 1,
        stocks: {
          amritsar: 100,
          jalandhar: 100,
          batala: 50,
          gurdaspur: 50
        }
      }
      updatedProducts.push(newProduct)
    }

    onSave({ ...store, products: updatedProducts })
    setIsModalOpen(false)
  }

  const handleDeleteProduct = (prodId) => {
    if (window.confirm('Are you sure you want to remove this product pack?')) {
      const updatedProducts = store.products.filter(p => p.id !== prodId)
      onSave({ ...store, products: updatedProducts })
    }
  }

  return (
    <div className="admin-products-view">
      
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Products & Pack Sizing Catalog</h3>
            <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>
              Manage fresh onion pack sizes (1kg–10kg), prices, bundle visualizer quantities, and status.
            </p>
          </div>
          <button className="admin-btn primary" onClick={openCreateModal}>
            + Add New Product Pack
          </button>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Pack Name</th>
                <th>Weight / Bundles</th>
                <th>Selling Price (₹)</th>
                <th>MRP / Strikethrough</th>
                <th>Discount Tag</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {store.products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                    <div style={{ fontSize: '11.5px', color: '#777', maxWidth: '300px' }}>
                      {p.description}
                    </div>
                  </td>
                  <td>
                    <span className="topbar-badge hub-badge" style={{ fontSize: '12px' }}>
                      🧅 {p.weight} ({p.bundles || p.weightKg} {p.bundles === 1 ? 'bundle' : 'bundles'})
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: '#74114e', fontSize: '15px' }}>₹{p.price?.toFixed(2)}</strong>
                  </td>
                  <td>
                    <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '13px' }}>
                      ₹{p.oldPrice?.toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <span style={{ background: '#fee2e2', color: '#dc2626', fontWeight: 700, fontSize: '11px', padding: '2px 8px', borderRadius: '6px' }}>
                      {p.discount || 'Special'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${p.status}`}>
                      {p.status === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="table-icon-btn edit" onClick={() => openEditModal(p)}>
                        Edit
                      </button>
                      <button className="table-icon-btn delete" onClick={() => handleDeleteProduct(p.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Edit / Create Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>{editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product Pack'}</h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Product Pack Title *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Fresh Red Onions - 5kg Sack"
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Pack Label (e.g. 5 kg) *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="e.g. 5 kg"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Bundle Count (1-10 for visualizer) *</label>
                    <input 
                      type="number" 
                      min="1"
                      max="20"
                      required 
                      value={formData.bundles}
                      onChange={(e) => setFormData({ ...formData, bundles: e.target.value, weightKg: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Selling Price (₹ INR) *</label>
                    <input 
                      type="number" 
                      step="0.01"
                      required 
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g. 175.00"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Original MRP (₹ INR)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={formData.oldPrice}
                      onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                      placeholder="e.g. 225.00"
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Discount Badge Text</label>
                    <input 
                      type="text" 
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      placeholder="e.g. 22% OFF"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Catalog Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="in_stock">In Stock (Available on Storefront)</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Description / Farm Notes</label>
                  <textarea 
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter short culinary / harvest notes..."
                  ></textarea>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn primary">
                  {editingProduct ? 'Update Product' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
