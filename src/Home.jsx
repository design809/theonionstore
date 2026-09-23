import React from 'react'
import { Link } from 'react-router-dom'
import Slider from './slider'
import Products from './products'
import './Home.css'

export default function Home() {
  return (
    <div className="home-page-view">
      {/* 1. Hero Banner Slider */}
      <Slider />

      {/* 2. Featured Fresh Onion Products */}
      <Products />

      {/* 3. Quick Explore Hub / Highlights Section */}
      <section className="home-highlights-section">
        <div className="home-highlights-container">
          
          <div className="highlight-banner-head">
            <span className="highlight-badge">WHY CHOOSE THE ONION STORE</span>
            <h2 className="highlight-title">From Organic Soil Directly To Your Kitchen</h2>
            <p className="highlight-sub">
              100% naturally cured red onions directly procured from certified partner farms across Nashik and Punjab.
            </p>
          </div>

          <div className="home-highlights-grid">
            
            {/* Card 1: About Us */}
            <div className="home-hl-card">
              <div className="hl-icon">🏛️</div>
              <h3>4 Regional Punjab Hubs</h3>
              <p>Depots in Amritsar, Jalandhar, Batala, and Gurdaspur guaranteeing same-day express delivery.</p>
              <Link to="/about-us" className="hl-link-btn">
                Read About Us &rarr;
              </Link>
            </div>

            {/* Card 2: Our Farmers */}
            <div className="home-hl-card">
              <div className="hl-icon">🚜</div>
              <h3>Fair-Trade Farmer Network</h3>
              <p>Direct farmer partnership offering 25%+ above mandi MSP rates and eco-friendly cultivation.</p>
              <Link to="/our-farmers" className="hl-link-btn">
                Meet Our Farmers &rarr;
              </Link>
            </div>

            {/* Card 3: Bulk Inquiries */}
            <div className="home-hl-card">
              <div className="hl-icon">📞</div>
              <h3>Bulk & Wholesale Booking</h3>
              <p>Custom wholesale supply for hotels, dhabas, caterers, and daily household needs.</p>
              <Link to="/contact-us" className="hl-link-btn">
                Contact & Inquiries &rarr;
              </Link>
            </div>

            {/* Card 4: FAQ & Guides */}
            <div className="home-hl-card">
              <div className="hl-icon">❓</div>
              <h3>Help & Storage Guides</h3>
              <p>Storage techniques, answers to pack sizing, freshness guarantees, and delivery radius.</p>
              <Link to="/faq" className="hl-link-btn">
                View FAQs &rarr;
              </Link>
            </div>

          </div>

        </div>
      </section>
    </div>
  )
}
