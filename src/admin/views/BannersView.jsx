import React, { useState, useRef } from 'react'
import slide1 from '../../assets/slider-bg-1.jpg'
import slide2 from '../../assets/slider-bg-2.jpg'
import slide3 from '../../assets/slider-bg-3.jpg'
import { resolveBannerImage } from '../adminStore'

const PRESET_IMAGES = [
  { id: 'preset1', label: 'Farm Field 1', src: slide1 },
  { id: 'preset2', label: 'Fresh Harvest 2', src: slide2 },
  { id: 'preset3', label: 'Organic Red Onions 3', src: slide3 }
]

export default function BannersView({ store, onSave }) {
  const [editingBanner, setEditingBanner] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    watermark: '',
    title: '',
    description: '',
    btnText: '',
    btnLink: '/products',
    image: slide1
  })
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef(null)

  const openEditModal = (banner) => {
    setEditingBanner(banner)
    setFormData({
      watermark: banner.watermark || '',
      title: banner.title || '',
      description: banner.description || '',
      btnText: banner.btnText || '',
      btnLink: banner.btnLink || '/products',
      image: resolveBannerImage(banner.image) || slide1
    })
    setUploadError('')
    setIsModalOpen(true)
  }

  const openAddModal = () => {
    setEditingBanner(null)
    setFormData({
      watermark: 'FRESH',
      title: 'New Organic Harvest Red Onions',
      description: 'Hand-picked from certified Punjab farmlands with guaranteed sweetness and pungency.',
      btnText: 'EXPLORE PACKS',
      btnLink: '/products',
      image: slide1
    })
    setUploadError('')
    setIsModalOpen(true)
  }

  // Handle local file upload with canvas compression to ensure snappy localStorage performance
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP).')
      return
    }

    setUploadError('')
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const maxDim = 1200
        let { width, height } = img
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          } else {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75)
        setFormData(prev => ({ ...prev, image: compressedDataUrl }))
      }
      img.onerror = () => {
        setUploadError('Failed to process image file.')
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    const updatedBanners = [...(store.banners || [])]
    const bannerPayload = {
      ...formData,
      image: resolveBannerImage(formData.image) || slide1
    }

    if (editingBanner) {
      const idx = updatedBanners.findIndex(b => String(b.id) === String(editingBanner.id))
      if (idx !== -1) {
        updatedBanners[idx] = {
          ...updatedBanners[idx],
          ...bannerPayload
        }
      }
    } else {
      const newBanner = {
        id: Date.now(),
        ...bannerPayload
      }
      updatedBanners.push(newBanner)
    }

    onSave({ ...store, banners: updatedBanners })
    setIsModalOpen(false)
  }

  const handleDeleteBanner = (bannerId) => {
    if (store.banners.length <= 1) {
      alert('You must keep at least 1 hero banner slide!')
      return
    }
    if (window.confirm('Delete this hero banner slide?')) {
      const updatedBanners = store.banners.filter(b => b.id !== bannerId)
      onSave({ ...store, banners: updatedBanners })
    }
  }

  return (
    <div className="admin-banners-view">
      
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Main Hero Slider Banners & Backgrounds</h3>
            <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>
              Customize background images, headline typography, watermark text, and call-to-action buttons for the homepage slider.
            </p>
          </div>
          <button className="admin-btn primary" onClick={openAddModal}>
            + Add New Banner Slide
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {store.banners.map((banner, index) => (
            <div 
              key={banner.id}
              style={{
                border: '1px solid #ebd9e5',
                borderRadius: '12px',
                padding: '16px 20px',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
                boxShadow: '0 2px 8px rgba(116, 17, 78, 0.03)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flex: 1, minWidth: 0 }}>
                {/* Banner Thumbnail with Preview Overlay */}
                <div 
                  style={{
                    width: '130px',
                    height: '80px',
                    borderRadius: '10px',
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.45)), url(${resolveBannerImage(banner.image, index)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: '#74114e',
                    border: '2px solid #ebd9e5',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                    flexShrink: 0,
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.5px' }}>
                    Slide #{index + 1}
                  </span>
                  <span style={{ fontSize: '9.5px', opacity: 0.9, textTransform: 'uppercase' }}>
                    {banner.watermark}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="topbar-badge hub-badge" style={{ padding: '2px 8px', fontSize: '10.5px' }}>
                      WATERMARK: {banner.watermark}
                    </span>
                    <strong style={{ fontSize: '15px', color: '#1a1a1a' }}>{banner.title}</strong>
                  </div>
                  <p style={{ fontSize: '12.5px', color: '#666', margin: 0, maxWidth: '650px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {banner.description}
                  </p>
                  <div style={{ fontSize: '11.5px', color: '#74114e', fontWeight: 600 }}>
                    Button: <span style={{ color: '#2b041c', fontWeight: 700 }}>"{banner.btnText}"</span> &rarr; Links to: <code>{banner.btnLink}</code>
                  </div>
                </div>
              </div>

              <div className="table-actions" style={{ flexShrink: 0 }}>
                <button className="table-icon-btn edit" onClick={() => openEditModal(banner)}>
                  Edit Banner & Image
                </button>
                <button className="table-icon-btn delete" onClick={() => handleDeleteBanner(banner.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Banner Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card" style={{ maxWidth: '680px', width: '95%' }}>
            <div className="admin-modal-header">
              <h3>{editingBanner ? 'Edit Hero Banner Slide' : 'Add New Hero Banner Slide'}</h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="admin-modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                
                {/* 1. BANNER IMAGE CUSTOMIZATION & PREVIEW */}
                <div style={{
                  background: '#faf4f8',
                  border: '1px solid #ebd0e2',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#74114e', margin: 0 }}>
                      🖼️ Hero Banner Background Image *
                    </label>
                    <span style={{ fontSize: '11px', color: '#888' }}>
                      Recommended: 1920 × 800 px (Landscape)
                    </span>
                  </div>

                  {/* Live Visual Banner Preview */}
                  <div 
                    style={{
                      height: '140px',
                      borderRadius: '10px',
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.55)), url(${resolveBannerImage(formData.image)})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundColor: '#2b041c',
                      border: '2px solid #74114e',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      textAlign: 'center',
                      padding: '16px',
                      marginBottom: '14px',
                      boxShadow: 'inset 0 0 30px rgba(0,0,0,0.35)'
                    }}
                  >
                    <span style={{ 
                      position: 'absolute', 
                      top: '8px', 
                      left: '12px', 
                      background: 'rgba(0,0,0,0.6)', 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      fontSize: '10px', 
                      letterSpacing: '1px' 
                    }}>
                      LIVE SLIDE PREVIEW
                    </span>

                    <span style={{ 
                      fontSize: '28px', 
                      fontWeight: 900, 
                      opacity: 0.25, 
                      letterSpacing: '4px',
                      position: 'absolute',
                      pointerEvents: 'none'
                    }}>
                      {formData.watermark || 'WATERMARK'}
                    </span>

                    <h4 style={{ 
                      fontSize: '16px', 
                      fontWeight: 700, 
                      margin: '0 0 6px 0', 
                      color: '#fff', 
                      textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                      maxWidth: '90%'
                    }}>
                      {formData.title || 'Slide Title Preview'}
                    </h4>

                    <span style={{
                      display: 'inline-block',
                      background: '#74114e',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '4px 12px',
                      borderRadius: '20px',
                      border: '1px solid rgba(255,255,255,0.4)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
                    }}>
                      {formData.btnText || 'BUTTON'} &rarr;
                    </span>
                  </div>

                  {/* Upload File and URL Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageUpload}
                      />
                      <button 
                        type="button" 
                        className="admin-btn primary"
                        style={{ padding: '8px 14px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        📁 Upload Image From Computer
                      </button>
                      
                      <span style={{ fontSize: '12px', color: '#777' }}>or choose preset:</span>
                      
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {PRESET_IMAGES.map((preset, pIdx) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, image: preset.src }))}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              border: formData.image === preset.src ? '2px solid #74114e' : '1px solid #ccc',
                              background: formData.image === preset.src ? '#ebd0e2' : '#fff',
                              color: '#333'
                            }}
                          >
                            Preset {pIdx + 1}
                          </button>
                        ))}
                      </div>
                    </div>

                    {uploadError && (
                      <div style={{ color: '#b91c1c', fontSize: '12px', fontWeight: 600 }}>
                        ⚠️ {uploadError}
                      </div>
                    )}

                    <div>
                      <label style={{ fontSize: '11.5px', color: '#555', display: 'block', marginBottom: '3px' }}>
                        Or Paste Web Image URL (HTTPS link or Base64 data string):
                      </label>
                      <input 
                        type="text" 
                        value={formData.image.startsWith('data:') ? 'Custom Uploaded Image (Base64)' : formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="https://example.com/banner.jpg"
                        style={{ width: '100%', fontSize: '12px', padding: '7px 10px' }}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. TEXT & CONTENT FIELDS */}
                <div className="admin-form-group">
                  <label>Background Watermark Text (e.g. ONIONS, ORGANIC, HARVEST) *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.watermark}
                    onChange={(e) => setFormData({ ...formData, watermark: e.target.value })}
                    placeholder="e.g. ONIONS"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Main Headline Title *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Fresh Onions For Live Healthy"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Subtitle / Description *</label>
                  <textarea 
                    rows="3"
                    required 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter short farm hero description..."
                  ></textarea>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>CTA Button Text *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.btnText}
                      onChange={(e) => setFormData({ ...formData, btnText: e.target.value })}
                      placeholder="e.g. SHOP ONIONS"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>CTA Destination Page *</label>
                    <select 
                      value={formData.btnLink}
                      onChange={(e) => setFormData({ ...formData, btnLink: e.target.value })}
                    >
                      <option value="/products">Products Page (/products)</option>
                      <option value="/about-us">About Us Page (/about-us)</option>
                      <option value="/our-farmers">Our Farmers Page (/our-farmers)</option>
                      <option value="/contact-us">Contact Us Page (/contact-us)</option>
                      <option value="/blog">Blog Page (/blog)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn primary">
                  Save Banner Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

