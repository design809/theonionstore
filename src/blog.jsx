import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAdminStore } from './admin/adminStore'
import './blog.css'

export default function Blog() {
  const [store, setStore] = useState(getAdminStore())
  const [selectedTag, setSelectedTag] = useState('All')

  useEffect(() => {
    const handleUpdate = () => {
      setStore(getAdminStore())
    }
    window.addEventListener('admin_store_updated', handleUpdate)
    return () => window.removeEventListener('admin_store_updated', handleUpdate)
  }, [])

  const blogPosts = store.blogs || []
  const tags = ['All', 'Organic Farming', 'Storage Tips', 'Fair Trade', 'Health Benefits']

  const filteredPosts = selectedTag === 'All' 
    ? blogPosts 
    : blogPosts.filter(p => p.tags && p.tags.includes(selectedTag))

  return (
    <div className="blog-page-container">
      
      {/* Blog Page Hero */}
      <section className="blog-hero-section">
        <div className="blog-container">
          <span className="blog-badge">FARM STORIES & INSIGHTS</span>
          <h1 className="blog-main-title">The Onion Store Journal</h1>
          <p className="blog-main-subtitle">
            Expert agricultural guides, onion storage tips, fair-trade stories from Punjab farmers, and nutritional insights.
          </p>
        </div>
      </section>

      {/* Filter Chips */}
      <section className="blog-filter-section">
        <div className="blog-container">
          <div className="blog-filter-chips">
            {tags.map((tag) => (
              <button
                key={tag}
                className={`blog-filter-btn ${selectedTag === tag ? 'active' : ''}`}
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="blog-posts-section">
        <div className="blog-container">
          <div className="blog-grid">
            {filteredPosts.map((post) => (
              <article key={post.id} className="blog-card">
                <div className="blog-card-header">
                  <span className="blog-category-tag">{post.category}</span>
                  <span className="blog-read-time">{post.readTime}</span>
                </div>

                <h2 className="blog-card-title">{post.title}</h2>
                <p className="blog-card-excerpt">{post.excerpt}</p>
                <p className="blog-card-content">{post.content}</p>

                <div className="blog-card-footer">
                  <div className="blog-meta">
                    <span className="blog-author">✍️ {post.author}</span>
                    <span className="blog-date">📅 {post.date}</span>
                  </div>
                  <div className="blog-tags-row">
                    {post.tags.map(t => (
                      <span key={t} className="blog-tag-pill">#{t}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Newsletter / Bulk Supply CTA */}
          <div className="blog-cta-box">
            <div className="cta-left">
              <h3>Looking for Fresh Doorstep Delivery in Punjab?</h3>
              <p>Order direct from our Amritsar, Jalandhar, Batala, or Gurdaspur depots today.</p>
            </div>
            <div className="cta-right">
              <Link to="/products" className="blog-cta-btn primary">
                Shop 1kg–10kg Packs
              </Link>
              <Link to="/contact-us" className="blog-cta-btn secondary">
                Contact Nearest Hub
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
