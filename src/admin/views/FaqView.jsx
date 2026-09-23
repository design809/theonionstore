import React, { useState } from 'react'

export default function FaqView({ store, onSave }) {
  const [editingFaq, setEditingFaq] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    category: 'sourcing',
    question: '',
    answer: ''
  })

  const openCreateModal = () => {
    setEditingFaq(null)
    setFormData({
      category: 'sourcing',
      question: '',
      answer: ''
    })
    setIsModalOpen(true)
  }

  const openEditModal = (faq) => {
    setEditingFaq(faq)
    setFormData({
      category: faq.category || 'sourcing',
      question: faq.question || '',
      answer: faq.answer || ''
    })
    setIsModalOpen(true)
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    const updatedFaqs = [...store.faqs]

    if (editingFaq) {
      const idx = updatedFaqs.findIndex(f => f.id === editingFaq.id)
      if (idx !== -1) {
        updatedFaqs[idx] = {
          ...updatedFaqs[idx],
          ...formData
        }
      }
    } else {
      const newFaq = {
        id: Date.now(),
        ...formData
      }
      updatedFaqs.push(newFaq)
    }

    onSave({ ...store, faqs: updatedFaqs })
    setIsModalOpen(false)
  }

  const handleDeleteFaq = (faqId) => {
    if (window.confirm('Are you sure you want to delete this FAQ item?')) {
      const updatedFaqs = store.faqs.filter(f => f.id !== faqId)
      onSave({ ...store, faqs: updatedFaqs })
    }
  }

  return (
    <div className="admin-faq-view">
      
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Frequently Asked Questions (FAQ) Manager</h3>
            <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>
              Add, modify, and categorize customer help questions displayed on the storefront FAQ page.
            </p>
          </div>
          <button className="admin-btn primary" onClick={openCreateModal}>
            + Add New FAQ Question
          </button>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Question</th>
                <th>Answer</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {store.faqs.map((f) => (
                <tr key={f.id}>
                  <td>
                    <span className="topbar-badge hub-badge" style={{ padding: '2px 8px', fontSize: '11px', textTransform: 'capitalize' }}>
                      {f.category}
                    </span>
                  </td>
                  <td>
                    <strong style={{ fontSize: '13.5px', color: '#1a1a1a' }}>{f.question}</strong>
                  </td>
                  <td>
                    <p style={{ fontSize: '12.5px', color: '#666', margin: 0, maxWidth: '420px', lineHeight: 1.5 }}>
                      {f.answer}
                    </p>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="table-icon-btn edit" onClick={() => openEditModal(f)}>
                        Edit
                      </button>
                      <button className="table-icon-btn delete" onClick={() => handleDeleteFaq(f.id)}>
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

      {/* Modal Popup */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>{editingFaq ? 'Edit FAQ Item' : 'Add New FAQ Question'}</h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Filter Category *</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="sourcing">Farm Sourcing (Nashik / Punjab)</option>
                    <option value="orders">Packs & Pricing (1kg to 10kg)</option>
                    <option value="delivery">Punjab Same-Day Delivery</option>
                    <option value="quality">Storage & Quality</option>
                    <option value="wholesale">Wholesale & Bulk Supply</option>
                    <option value="payment">Payment & Refunds</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Question *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    placeholder="e.g. How long can I store red onions at room temperature?"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Answer Explanation *</label>
                  <textarea 
                    rows="4"
                    required 
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    placeholder="Provide detailed, clear customer response..."
                  ></textarea>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn primary">
                  {editingFaq ? 'Save FAQ' : 'Add FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
