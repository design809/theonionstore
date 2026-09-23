import React from 'react'
import './our-farmers.css'

export const FARMERS_DATA = [
  {
    id: 1,
    name: 'S. Gurmukh Singh',
    location: 'Gurdaspur, Punjab',
    experience: '28+ Years Farming',
    specialty: 'Traditional Red Onion Cultivation',
    badge: 'Heritage Farmer',
    quote: 'We nurture our onion crops using organic bio-fertilizers and Ravi river irrigation. The Onion Store gives our harvest direct respect and fair prices.',
    rating: '5.0',
    harvestArea: '14 Acres Farm'
  },
  {
    id: 2,
    name: 'Ramesh Patil',
    location: 'Nashik Valley, Maharashtra',
    experience: '22+ Years Farming',
    specialty: 'Nashik Deep-Purple Bulb Farming',
    badge: 'Nashik Pioneer',
    quote: 'Our fertile black soil produces the sharpest, high-pungency red onions. Through this platform, our produce reaches Punjab kitchens within 48 hours.',
    rating: '5.0',
    harvestArea: '20 Acres Farm'
  },
  {
    id: 3,
    name: 'Harpreet Kaur & Family',
    location: 'Batala Agro Belt, Punjab',
    experience: '16+ Years Farming',
    specialty: 'Chemical-Free Organic Curing',
    badge: 'Organic Certified',
    quote: 'Natural field curing in the Punjab sun gives our onions an impenetrable dry outer skin that stays fresh in your kitchen for months without spoiling.',
    rating: '5.0',
    harvestArea: '9 Acres Farm'
  }
]

export default function OurFarmers() {
  return (
    <section className="farmers-section" id="our-farmers" aria-label="Our Dedicated Farmers and Agricultural Partners">
      <div className="farmers-container">
        
        {/* Section Header */}
        <div className="farmers-header">
          <span className="farmers-badge">ROOTED IN HONEST FARMING</span>
          <h2 className="farmers-title">Meet Our Dedicated Farmers</h2>
          <p className="farmers-subtitle">
            The heart and soul of <strong>The Onion Store</strong>. We empower over 250+ smallholder farming families across Punjab and Nashik through direct ethical sourcing, zero middleman exploitation, and guaranteed living wages.
          </p>
        </div>

        {/* 3 Pillars of Farmer Partnership */}
        <div className="farmer-pillars-row">
          <div className="pillar-item">
            <div className="pillar-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div className="pillar-info">
              <h4>25%+ Above Mandi MSP</h4>
              <p>Guaranteed direct farmer payouts higher than volatile APMC market benchmarks.</p>
            </div>
          </div>

          <div className="pillar-item">
            <div className="pillar-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
              </svg>
            </div>
            <div className="pillar-info">
              <h4>100% Drip Irrigation</h4>
              <p>Sustainable water conservation saving over 4 million liters annually.</p>
            </div>
          </div>

          <div className="pillar-item">
            <div className="pillar-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
            </div>
            <div className="pillar-info">
              <h4>Zero Residue Promise</h4>
              <p>Traditional non-toxic pest management and organic compost nourishment.</p>
            </div>
          </div>
        </div>

        {/* Farmer Spotlight Cards Grid */}
        <div className="farmers-cards-grid">
          {FARMERS_DATA.map((farmer) => (
            <article key={farmer.id} className="farmer-card" itemScope itemType="https://schema.org/Person">
              <div className="farmer-card-top">
                <div className="farmer-avatar-circle">
                  <span className="farmer-initials">
                    {farmer.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </span>
                </div>
                <div className="farmer-meta">
                  <h3 className="farmer-name" itemProp="name">{farmer.name}</h3>
                  <div className="farmer-loc-row">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#6db327" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span itemProp="homeLocation">{farmer.location}</span>
                  </div>
                </div>
                <span className="farmer-badge-tag">{farmer.badge}</span>
              </div>

              {/* Specialty & Details */}
              <div className="farmer-stats-box">
                <div className="stat-col">
                  <span className="stat-label">Specialty</span>
                  <span className="stat-val">{farmer.specialty}</span>
                </div>
                <div className="stat-col">
                  <span className="stat-label">Experience</span>
                  <span className="stat-val">{farmer.experience}</span>
                </div>
              </div>

              {/* Quote */}
              <blockquote className="farmer-quote">
                &ldquo;{farmer.quote}&rdquo;
              </blockquote>

              {/* Card Footer */}
              <div className="farmer-card-footer">
                <span className="harvest-badge">🌱 {farmer.harvestArea}</span>
                <span className="quality-rating">⭐ {farmer.rating} Rated Quality</span>
              </div>
            </article>
          ))}
        </div>

        {/* Fair-Trade Commitment Banner */}
        <div className="farmer-pledge-banner">
          <div className="pledge-text-wrap">
            <h4 className="pledge-title">Our Farm-To-Fork Fair Trade Pledge</h4>
            <p className="pledge-desc">
              Every kilogram of fresh red onions you buy directly supports soil regeneration programs, clean drip kits, and child education funds in farming villages across Gurdaspur, Batala, Amritsar, and Nashik.
            </p>
          </div>
          <a href="#fresh-onions-section" className="pledge-shop-btn">
            Support Our Farmers & Shop Now
          </a>
        </div>

      </div>
    </section>
  )
}
