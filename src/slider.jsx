import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStore, resolveBannerImage } from './admin/adminStore';
import './slider.css';

export default function Slider() {
  const [store, setStore] = useState(getAdminStore());
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const slidesData = store.banners || [];

  useEffect(() => {
    const handleUpdate = () => {
      setStore(getAdminStore());
    };
    window.addEventListener('admin_store_updated', handleUpdate);
    return () => window.removeEventListener('admin_store_updated', handleUpdate);
  }, []);

  // Auto-play timer (slides every 6 seconds, pauses on hover)
  useEffect(() => {
    if (isHovered || slidesData.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesData.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isHovered, slidesData.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slidesData.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slidesData.length) % slidesData.length);
  };

  // Touch swipe support for mobile devices
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      nextSlide(); // Swipe left
    }
    if (touchStartX.current - touchEndX.current < -50) {
      prevSlide(); // Swipe right
    }
  };

  return (
    <section
      className="greenbee-slider-section"
      id="home"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Hero Onion Slider"
    >
      <div className="greenbee-slider-wrapper">
        {slidesData.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`greenbee-slide ${isActive ? 'is-active' : ''}`}
              style={{ backgroundImage: `url(${resolveBannerImage(slide.image, index)})` }}
              aria-hidden={!isActive}
            >
              {/* Subtle Dark Vignette Overlay for Crisp Contrast */}
              <div className="greenbee-slide-overlay" />

              {/* Centered Typography Content */}
              <div className="greenbee-slide-content-container">
                <div className="greenbee-slide-content">
                  
                  {/* Large Faint Watermark Text Behind Heading */}
                  <span className="greenbee-watermark-text" aria-hidden="true">
                    {slide.watermark}
                  </span>

                  {/* Main Serif Italic Heading */}
                  <h2 className="greenbee-slide-title">
                    {slide.title}
                  </h2>

                  {/* Italic Descriptive Paragraph */}
                  <p className="greenbee-slide-desc">
                    {slide.description}
                  </p>

                  {/* Slide CTA Button */}
                  {slide.btnText && (
                    <div style={{ marginTop: '20px', zIndex: 3, position: 'relative' }}>
                      <Link to={slide.btnLink || '/products'} className="greenbee-slider-cta-btn">
                        {slide.btnText} &rarr;
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Left & Right Navigation Arrows */}
      <button
        type="button"
        className="greenbee-slider-arrow prev-arrow"
        onClick={prevSlide}
        aria-label="Previous Slide"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <button
        type="button"
        className="greenbee-slider-arrow next-arrow"
        onClick={nextSlide}
        aria-label="Next Slide"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Pagination Indicator Dots (Bottom Center) */}
      <div className="greenbee-slider-dots">
        {slidesData.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`greenbee-dot-btn ${index === currentSlide ? 'is-active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          >
            <span className="greenbee-dot-inner" />
          </button>
        ))}
      </div>
    </section>
  );
}
