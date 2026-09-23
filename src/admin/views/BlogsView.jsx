import React, { useState } from 'react'

export default function BlogsView({ store, onSave }) {
  const [editingBlog, setEditingBlog] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    readTime: '3 min read',
    tags: '',
    excerpt: '',
    content: ''
  })

  const openCreateModal = () => {
    setEditingBlog(null)
    setFormData({
      title: '',
      author: 'The Onion Store Editorial Team',
      category: 'Farming & Origin',
      readTime: '4 min read',
      tags: 'Organic Farming, Punjab Harvest',
      excerpt: '',
      content: ''
    })
    setIsModalOpen(true)
  }

  const openEditModal = (blog) => {
    setEditingBlog(blog)
    setFormData({
      title: blog.title,
      author: blog.author,
      category: blog.category,
      readTime: blog.readTime || '4 min read',
      tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : blog.tags || '',
      excerpt: blog.excerpt || '',
      content: blog.content || ''
    })
    setIsModalOpen(true)
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    const updatedBlogs = [...store.blogs]
    const tagArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean)

    if (editingBlog) {
      const idx = updatedBlogs.findIndex(b => b.id === editingBlog.id)
      if (idx !== -1) {
        updatedBlogs[idx] = {
          ...updatedBlogs[idx],
          ...formData,
          tags: tagArray
        }
      }
    } else {
      const newBlog = {
        id: Date.now(),
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        ...formData,
        tags: tagArray
      }
      updatedBlogs.unshift(newBlog)
    }

    onSave({ ...store, blogs: updatedBlogs })
    setIsModalOpen(false)
  }

  const handleDeleteBlog = (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog article?')) {
      const updatedBlogs = store.blogs.filter(b => b.id !== blogId)
      onSave({ ...store, blogs: updatedBlogs })
    }
  }

  return (
    <div className="admin-blogs-view">
      
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Farming Journal & SEO Blog Articles</h3>
            <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>
              Publish and manage agricultural guides, storage hacks, fair-trade stories, and nutritional benefits.
            </p>
          </div>
          <button className="admin-btn primary" onClick={openCreateModal}>
            + Write New Article
          </button>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Article Title</th>
                <th>Category</th>
                <th>Author</th>
                <th>Date</th>
                <th>Tags</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {store.blogs.map((b) => (
                <tr key={b.id}>
                  <td>
                    <strong style={{ fontSize: '13.5px' }}>{b.title}</strong>
                    <div style={{ fontSize: '11.5px', color: '#777', maxWidth: '340px' }}>
                      {b.excerpt}
                    </div>
                  </td>
                  <td>
                    <span className="topbar-badge hub-badge" style={{ padding: '2px 8px', fontSize: '11px' }}>
                      {b.category}
                    </span>
                  </td>
                  <td>{b.author}</td>
                  <td><span style={{ fontSize: '12px', color: '#666' }}>{b.date}</span></td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {b.tags?.map(t => (
                        <span key={t} style={{ background: '#f5edf3', color: '#74114e', fontSize: '10px', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                          #{t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="table-icon-btn edit" onClick={() => openEditModal(b)}>
                        Edit
                      </button>
                      <button className="table-icon-btn delete" onClick={() => handleDeleteBlog(b.id)}>
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
              <h3>{editingBlog ? 'Edit Blog Article' : 'Write New Blog Article'}</h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Article Title *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. The Secret Behind Nashik & Punjab Red Onions"
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Category *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g. Storage Guide, Fair Trade, Origin"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Author *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="e.g. Harpreet Singh (Agronomist)"
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Estimated Read Time</label>
                    <input 
                      type="text" 
                      value={formData.readTime}
                      onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                      placeholder="e.g. 4 min read"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Tags (Comma separated)</label>
                    <input 
                      type="text" 
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="e.g. Organic, Storage Tips, MSP"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Short Summary / Excerpt *</label>
                  <textarea 
                    rows="2"
                    required 
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Brief 1-2 sentence preview..."
                  ></textarea>
                </div>

                <div className="admin-form-group">
                  <label>Full Content Body *</label>
                  <textarea 
                    rows="5"
                    required 
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Enter comprehensive article paragraph..."
                  ></textarea>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn primary">
                  {editingBlog ? 'Save Article' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
