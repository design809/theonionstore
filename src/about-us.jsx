import React, { useState, useEffect } from 'react'
import { getAdminStore } from './admin/adminStore'
import './about-us.css'

export default function AboutUs() {
  const [store, setStore] = useState(getAdminStore())
  const [activeBranchTab, setActiveBranchTab] = useState('all')

  useEffect(() => {
    const handleUpdate = () => {
      setStore(getAdminStore())
    }
    window.addEventListener('admin_store_updated', handleUpdate)
    return () => window.removeEventListener('admin_store_updated', handleUpdate)
  }, [])

  const branchesList = store.branches || []

  const filteredBranches = activeBranchTab === 'all'
    ? branchesList
    : branchesList.filter(b => b.id === activeBranchTab)

  return (
    <section className="about-section" id="about-us" aria-label="About The Onion Store and Regional Branches">
      <div className="about-container">
        
        {/* Section Header */}
        <div className="about-header">
          <span className="about-badge">PUNJAB'S PREMIER AGRO HARVEST</span>
          <h2 className="about-title">About The Onion Store</h2>
          <p className="about-subtitle">
            Delivering farm-fresh, premium graded organic red onions straight from fertile Nashik and Punjab agro-farms to your kitchen doorstep across Majha and Doaba regions.
          </p>
        </div>

        {/* Story & Value Propositions 2-Column Grid */}
        <div className="about-story-grid">
          <div className="about-story-col">
            <h3 className="story-heading">Direct From Soil To Your Home</h3>
            <p className="story-paragraph">
              Founded with a pure agricultural vision, <strong>The Onion Store</strong> bridges the gap between dedicated farming communities and households. We hand-select crisp, aromatic, and pungent red onions, curing them in temperature-regulated facilities to ensure superior shelf-life and nutrient density.
            </p>
            <p className="story-paragraph">
              Whether you need a daily 1kg household pack or commercial 10kg wholesale sacks for dining and catering, our logistics hubs across <strong>Amritsar, Jalandhar, Batala, and Gurdaspur</strong> ensure same-day dispatch and zero middlemen price advantages.
            </p>

            {/* Key Metrics / Highlights */}
            <div className="about-metrics-row">
              <div className="metric-box">
                <span className="metric-number">4</span>
                <span className="metric-label">Punjab Regional Hubs</span>
              </div>
              <div className="metric-box">
                <span className="metric-number">100%</span>
                <span className="metric-label">Natural & Farm Fresh</span>
              </div>
              <div className="metric-box">
                <span className="metric-number">50k+</span>
                <span className="metric-label">Satisfied Families</span>
              </div>
              <div className="metric-box">
                <span className="metric-number">₹35/kg</span>
                <span className="metric-label">Guaranteed Fair Price</span>
              </div>
            </div>
          </div>

          {/* Core Values Cards */}
          <div className="about-values-col">
            <div className="value-card">
              <div className="value-icon-box">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <polyline points="9 12 11 14 15 10"/>
                </svg>
              </div>
              <div className="value-text">
                <h4>Grade-A Quality Assurance</h4>
                <p>Triple-graded by hand to ensure zero mold, uniform bulb size, and dry papery skins that lock in natural flavors.</p>
              </div>
            </div>

            <div className="value-card">
              <div className="value-icon-box">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div className="value-text">
                <h4>Express Same-Day Dispatch</h4>
                <p>Dedicated localized delivery fleets operating 7 days a week across Amritsar, Jalandhar, Batala, and Gurdaspur.</p>
              </div>
            </div>

            <div className="value-card">
              <div className="value-icon-box">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className="value-text">
                <h4>Empowering Local Farmers</h4>
                <p>We work in ethical partnership with local growers, paying premium rates above APMC mandi benchmarks.</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Regional Branches Section */}
        <div className="branches-showcase-wrap">
          <div className="branches-header">
            <div className="branches-title-group">
              <span className="branches-tag">OUR REGIONAL NETWORK</span>
              <h3 className="branches-title">Our Punjab Branches & Contact Hubs</h3>
              <p className="branches-desc">
                Visit our local depots or reach out to our dedicated branch support teams directly via phone or email for retail and wholesale supply inquiries.
              </p>
            </div>

            {/* Branch Filter Tabs */}
            <div className="branch-filter-tabs">
              <button 
                className={`tab-btn ${activeBranchTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveBranchTab('all')}
              >
                All Branches ({branchesList.length})
              </button>
              {branchesList.map((b) => (
                <button 
                  key={b.id}
                  className={`tab-btn ${activeBranchTab === b.id ? 'active' : ''}`}
                  onClick={() => setActiveBranchTab(b.id)}
                >
                  {b.city}
                </button>
              ))}
            </div>
          </div>

          {/* 4 Branches Grid */}
          <div className="branches-grid">
            {filteredBranches.map((branch) => (
              <article key={branch.id} className="branch-card" itemScope itemType="https://schema.org/LocalBusiness">
                <div className="branch-card-header">
                  <div className="branch-city-meta">
                    <h4 className="branch-city-name" itemProp="name">
                      The Onion Store - {branch.city}
                    </h4>
                    <span className="branch-type-badge">{branch.badge}</span>
                  </div>
                  <div className="branch-city-pin">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#74114e" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                </div>

                {/* Address */}
                <div className="branch-info-block" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                  <div className="info-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                  <div className="info-text">
                    <span className="info-label">Address:</span>
                    <p className="info-val" itemProp="streetAddress">{branch.address}</p>
                  </div>
                </div>

                {/* Phone Numbers */}
                <div className="branch-info-block">
                  <div className="info-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  <div className="info-text">
                    <span className="info-label">Contact Phones:</span>
                    <div className="phone-links">
                      <a href={`tel:${branch.phone.replace(/\s+/g, '')}`} className="contact-link" itemProp="telephone">
                        {branch.phone}
                      </a>
                      <span className="phone-sep">|</span>
                      <a href={`tel:${branch.altPhone.replace(/\s+/g, '')}`} className="contact-link">
                        {branch.altPhone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Email Address */}
                <div className="branch-info-block">
                  <div className="info-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div className="info-text">
                    <span className="info-label">Branch Email:</span>
                    <a href={`mailto:${branch.email}`} className="contact-link" itemProp="email">
                      {branch.email}
                    </a>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="branch-info-block">
                  <div className="info-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div className="info-text">
                    <span className="info-label">Operating Hours:</span>
                    <p className="info-val">{branch.hours}</p>
                  </div>
                </div>

                {/* Service Coverage */}
                <div className="branch-coverage-tag">
                  <span className="coverage-title">Delivery Radius:</span>
                  <span className="coverage-text">{branch.coverage}</span>
                </div>

                {/* Quick Action Button */}
                <div className="branch-action-row">
                  <a 
                    href={`tel:${branch.phone.replace(/\s+/g, '')}`}
                    className="branch-call-btn"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.44-5.15-3.75-6.59-6.59l1.97-1.57c.27-.27.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3.3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                    </svg>
                    Call Branch
                  </a>
                  <a 
                    href={`mailto:${branch.email}?subject=Inquiry for The Onion Store ${branch.city}`}
                    className="branch-email-btn"
                  >
                    Email Us
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
