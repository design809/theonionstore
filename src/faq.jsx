import React, { useState, useEffect } from 'react'
import { getAdminStore } from './admin/adminStore'
import './faq.css'

export default function FAQ() {
  const [store, setStore] = useState(getAdminStore())
  const [activeCategory, setActiveCategory] = useState('all')
  const [openFaqId, setOpenFaqId] = useState(1) // First FAQ open by default

  useEffect(() => {
    const handleUpdate = () => {
      setStore(getAdminStore())
    }
    window.addEventListener('admin_store_updated', handleUpdate)
    return () => window.removeEventListener('admin_store_updated', handleUpdate)
  }, [])

  const faqsList = store.faqs || []

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id)
  }

  const filteredFaqs = activeCategory === 'all'
    ? faqsList
    : faqsList.filter(faq => faq.category === activeCategory)

  return (
    <section className="faq-section" id="faq" aria-label="Frequently Asked Questions">
      <div className="faq-container">
        
        {/* Section Header */}
        <div className="faq-header">
          <span className="faq-badge">HELP & ANSWERS</span>
          <h2 className="faq-title">Frequently Asked Questions</h2>
          <p className="faq-subtitle">
            Everything you need to know about our fresh red onion sourcing, 1kg to 10kg pack sizes, same-day Punjab delivery, and storage tips.
          </p>
        </div>

        {/* Category Filter Chips */}
        <div className="faq-category-filters">
          <button 
            className={`faq-cat-btn ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All Questions ({faqsList.length})
          </button>
          <button 
            className={`faq-cat-btn ${activeCategory === 'sourcing' ? 'active' : ''}`}
            onClick={() => setActiveCategory('sourcing')}
          >
            Farm Sourcing
          </button>
          <button 
            className={`faq-cat-btn ${activeCategory === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveCategory('orders')}
          >
            Packs & Pricing
          </button>
          <button 
            className={`faq-cat-btn ${activeCategory === 'delivery' ? 'active' : ''}`}
            onClick={() => setActiveCategory('delivery')}
          >
            Punjab Delivery
          </button>
          <button 
            className={`faq-cat-btn ${activeCategory === 'quality' ? 'active' : ''}`}
            onClick={() => setActiveCategory('quality')}
          >
            Storage & Quality
          </button>
          <button 
            className={`faq-cat-btn ${activeCategory === 'wholesale' ? 'active' : ''}`}
            onClick={() => setActiveCategory('wholesale')}
          >
            Wholesale & Bulk
          </button>
        </div>

        {/* Accordion FAQ List (with Schema.org FAQPage structured data) */}
        <div className="faq-accordion-list" itemScope itemType="https://schema.org/FAQPage">
          {filteredFaqs.map((faq) => {
            const isOpen = openFaqId === faq.id

            return (
              <div 
                key={faq.id} 
                className={`faq-item ${isOpen ? 'is-open' : ''}`}
                itemScope 
                itemProp="mainEntity" 
                itemType="https://schema.org/Question"
              >
                <button 
                  className="faq-question-btn" 
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                >
                  <span className="question-text" itemProp="name">
                    {faq.question}
                  </span>
                  <span className="faq-toggle-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                      {isOpen ? (
                        <line x1="5" y1="12" x2="19" y2="12" />
                      ) : (
                        <>
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </>
                      )}
                    </svg>
                  </span>
                </button>

                {isOpen && (
                  <div 
                    className="faq-answer-panel"
                    itemScope 
                    itemProp="acceptedAnswer" 
                    itemType="https://schema.org/Answer"
                  >
                    <p className="answer-text" itemProp="text">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom Help Box */}
        <div className="faq-help-footer">
          <div className="help-footer-content">
            <span className="help-icon">💬</span>
            <div className="help-text">
              <h4>Still have questions or need custom wholesale supply?</h4>
              <p>Our dedicated Punjab customer care team is available daily from 7:00 AM to 9:00 PM.</p>
            </div>
          </div>
          <a href="#contact-us" className="help-contact-btn">
            Contact Support Team
          </a>
        </div>

      </div>
    </section>
  )
}
