import React, { useState, useEffect } from 'react'
import { getAdminStore, createCustomerOrder } from './admin/adminStore'
import './contact-us.css'

export default function ContactUs() {
  const [store, setStore] = useState(getAdminStore())
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    branch: 'amritsar',
    packSize: '5kg',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    const handleUpdate = () => {
      setStore(getAdminStore())
    }
    window.addEventListener('admin_store_updated', handleUpdate)
    return () => window.removeEventListener('admin_store_updated', handleUpdate)
  }, [])

  const branchesList = store.branches || []

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.phone) return

    // Calculate approx amount based on pack size
    let price = 175
    if (formData.packSize === '1kg') price = 35
    else if (formData.packSize === '2kg') price = 70
    else if (formData.packSize === '3kg') price = 105
    else if (formData.packSize === '5kg') price = 175
    else if (formData.packSize === '10kg') price = 350
    else if (formData.packSize.includes('25kg')) price = 850

    // Dispatch order directly to the branch in adminStore
    createCustomerOrder({
      customerName: formData.name,
      customerPhone: formData.phone,
      customerEmail: formData.email,
      deliveryAddress: formData.message || 'Punjab Express Customer Delivery Request',
      branchId: formData.branch,
      packSize: formData.packSize,
      quantity: 1,
      totalAmount: price,
      notes: formData.message
    })

    setIsSubmitted(true)
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        name: '',
        phone: '',
        email: '',
        branch: 'amritsar',
        packSize: '5kg',
        message: ''
      })
    }, 4500)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <section className="contact-section" id="contact-us" aria-label="Contact The Onion Store and Regional Punjab Hubs">
      <div className="contact-container">
        
        {/* Section Header */}
        <div className="contact-header">
          <span className="contact-badge">GET IN TOUCH</span>
          <h2 className="contact-title">Contact Us & Bulk Supply Inquiries</h2>
          <p className="contact-subtitle">
            Need daily fresh red onion delivery, commercial wholesale supply, or branch assistance? Reach out directly to our Punjab regional hubs or send us a message below.
          </p>
        </div>

        {/* 2-Column Contact Grid (Left: Form | Right: 4 Hubs Quick Contacts) */}
        <div className="contact-main-grid">
          
          {/* Left Column: Interactive Order / Inquiry Form */}
          <div className="contact-form-card">
            <div className="form-head">
              <h3 className="form-title">Send Us an Inquiry / Bulk Booking</h3>
              <p className="form-desc">Fill out your details for immediate doorstep dispatch or corporate bulk pricing.</p>
            </div>

            {isSubmitted ? (
              <div className="form-success-box">
                <div className="success-icon">✓</div>
                <h4>Thank you, {formData.name || 'Valued Customer'}!</h4>
                <p>Your inquiry for <strong>{formData.packSize}</strong> fresh red onions has been routed to our <strong>{formData.branch.toUpperCase()}</strong> hub. Our regional team will call you within 15 minutes.</p>
              </div>
            ) : (
              <form className="inquiry-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      placeholder="e.g. S. Harpreet Singh" 
                      required 
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      placeholder="e.g. +91 98765 43210" 
                      required 
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email Address (Optional)</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      placeholder="e.g. yourname@gmail.com" 
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="branch">Nearest Branch / Hub *</label>
                    <select 
                      id="branch" 
                      name="branch" 
                      value={formData.branch}
                      onChange={handleChange}
                    >
                      {branchesList.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.city} ({b.address.split(',')[0]})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="packSize">Required Pack Weight / Purpose</label>
                  <select 
                    id="packSize" 
                    name="packSize" 
                    value={formData.packSize}
                    onChange={handleChange}
                  >
                    <option value="1kg">1kg Household Pack (₹35.00)</option>
                    <option value="2kg">2kg Value Pack (₹70.00)</option>
                    <option value="3kg">3kg Family Pack (₹105.00)</option>
                    <option value="5kg">5kg Kitchen Sack (₹175.00)</option>
                    <option value="10kg">10kg Wholesale Bulk Sack (₹350.00)</option>
                    <option value="25kg+ Commercial Bulk">25kg+ Commercial Bulk Supply (Hotels / Caterers)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message / Delivery Address Instructions</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    rows="3" 
                    placeholder="Enter delivery address, landmark, or specific order requests..."
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <button type="submit" className="form-submit-btn">
                  Submit Inquiry / Request Callback
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Direct Regional Contact Hubs */}
          <div className="contact-hubs-col">
            <div className="central-hotline-card">
              <div className="hotline-icon">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div className="hotline-text">
                <span className="hotline-tag">PUNJAB CUSTOMER SUPPORT TOLL-FREE</span>
                <a href="tel:+919876543210" className="hotline-number">+91 98765 43210</a>
                <p className="hotline-hours">Daily: 7:00 AM – 9:30 PM (All 7 Days)</p>
              </div>
            </div>

            {/* Dynamic Mini Hub Cards from Admin Store */}
            <div className="mini-hubs-list">
              {branchesList.map(b => (
                <div key={b.id} className="mini-hub-item">
                  <div className="hub-city-col">
                    <strong>{b.city} Hub</strong>
                    <span>{b.address.split(',')[0]}</span>
                  </div>
                  <div className="hub-actions-col">
                    <a href={`tel:${b.phone.replace(/\s+/g, '')}`} className="hub-quick-btn call" title={`Call ${b.city}`}>{b.phone}</a>
                    <a href={`mailto:${b.email}`} className="hub-quick-btn mail">{b.email}</a>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}
