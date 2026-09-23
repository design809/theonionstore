import React, { useState, useEffect, useRef } from 'react'
import defaultLogo from '../../assets/logo.png'

const THEME_PRESETS = [
  {
    name: 'Classic Punjab Harvest (Default)',
    primaryColor: '#74114e',
    secondaryColor: '#6db327',
    topBarBgColor: '#0a6637',
    accentColor: '#eb001b'
  },
  {
    name: 'Nashik Ruby Red & Gold',
    primaryColor: '#881337',
    secondaryColor: '#eab308',
    topBarBgColor: '#4c0519',
    accentColor: '#f97316'
  },
  {
    name: 'Modern Emerald Agro',
    primaryColor: '#064e3b',
    secondaryColor: '#10b981',
    topBarBgColor: '#022c22',
    accentColor: '#f59e0b'
  },
  {
    name: 'Royal Majha Purple',
    primaryColor: '#581c87',
    secondaryColor: '#84cc16',
    topBarBgColor: '#3b0764',
    accentColor: '#ec4899'
  }
]

export default function StoreSettingsView({ store, onSave }) {
  const [activeTab, setActiveTab] = useState('theme')
  const [formData, setFormData] = useState({
    ...(store?.settings || {})
  })
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [logoUploadError, setLogoUploadError] = useState('')
  const [qrUploadError, setQrUploadError] = useState('')
  const logoFileInputRef = useRef(null)
  const qrFileInputRef = useRef(null)

  // Sync state if store updates from parent or another window
  useEffect(() => {
    if (store?.settings) {
      setFormData(prev => ({
        ...store.settings,
        ...prev
      }))
    }
  }, [store])

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] || {}),
        [field]: value
      }
    }))
  }

  const handleApplyPreset = (preset) => {
    setFormData(prev => ({
      ...prev,
      primaryColor: preset.primaryColor,
      secondaryColor: preset.secondaryColor,
      topBarBgColor: preset.topBarBgColor,
      accentColor: preset.accentColor
    }))
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setLogoUploadError('Please select a valid image file (PNG, JPG, SVG, WebP).')
      return
    }

    setLogoUploadError('')
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const maxDim = 800
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
        const compressedDataUrl = canvas.toDataURL('image/png')
        handleChange('customLogoUrl', compressedDataUrl)
      }
      img.onerror = () => {
        setLogoUploadError('Failed to process logo file.')
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const handlePaymentQrUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setQrUploadError('Please select a valid image file (PNG, JPG, WebP).')
      return
    }

    setQrUploadError('')
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const maxDim = 800
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
        const compressedDataUrl = canvas.toDataURL('image/png')
        handleNestedChange('payment', 'qrScannerImage', compressedDataUrl)
      }
      img.onerror = () => {
        setQrUploadError('Failed to process QR image.')
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    onSave({
      ...store,
      settings: formData
    })
    setSavedSuccess(true)
    setTimeout(() => {
      setSavedSuccess(false)
    }, 3000)
  }

  const handleResetDefaults = () => {
    if (window.confirm('Reset all theme, text, button, logo, and social settings back to factory defaults?')) {
      const defaultSettings = {
        siteTitle: 'The Onion Store',
        tagline: 'Farm to Store — Direct from Punjab & Nashik Agro Fields',
        logoText: 'The Onion Store',
        customLogoUrl: '',
        primaryColor: '#74114e',
        secondaryColor: '#6db327',
        topBarBgColor: '#0a6637',
        accentColor: '#eb001b',
        bodyBgColor: '#ffffff',
        announcementText: '⚡ Same-Day Express Delivery Across Amritsar, Jalandhar, Batala & Gurdaspur! Guaranteed ₹35/kg Fair Rates.',
        showAnnouncement: true,
        heroCtaText: 'SHOP 1KG - 10KG PACKS',
        contactHotline: '+91 98765 43210',
        supportEmail: 'support@theonionstore.in',
        workingHours: 'Mon - Sun: 7:00 AM - 9:30 PM',
        socialLinks: {
          facebook: 'https://facebook.com/theonionstore',
          instagram: 'https://instagram.com/theonionstore',
          twitter: 'https://twitter.com/theonionstore',
          pinterest: 'https://pinterest.com/theonionstore',
          youtube: 'https://youtube.com/@theonionstore',
          whatsapp: 'https://wa.me/919876543210'
        }
      }
      setFormData(defaultSettings)
      onSave({
        ...store,
        settings: defaultSettings
      })
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
    }
  }

  return (
    <div className="admin-store-settings-view">
      
      {/* View Header */}
      <div className="admin-card" style={{ marginBottom: '20px' }}>
        <div className="admin-card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚙️ Store Settings & Customization
            </h2>
            <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>
              Customize storefront brand theme colors, buttons, announcements, logo, contact hotline, and social media links.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button" 
              className="admin-btn secondary" 
              onClick={handleResetDefaults}
              style={{ fontSize: '12px' }}
            >
              ↺ Reset Defaults
            </button>
            <button 
              type="button" 
              className="admin-btn primary" 
              onClick={handleSubmit}
            >
              {savedSuccess ? '✓ Saved!' : 'Save All Settings'}
            </button>
          </div>
        </div>

        {/* Setting Section Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #ebd0e2', paddingTop: '14px', marginTop: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`admin-btn ${activeTab === 'theme' ? 'primary' : 'secondary'}`}
            onClick={() => setActiveTab('theme')}
            style={{ fontSize: '12.5px', padding: '7px 14px' }}
          >
            🎨 Theme & Colors
          </button>
          <button
            type="button"
            className={`admin-btn ${activeTab === 'branding' ? 'primary' : 'secondary'}`}
            onClick={() => setActiveTab('branding')}
            style={{ fontSize: '12.5px', padding: '7px 14px' }}
          >
            🏷️ Logo & Branding
          </button>
          <button
            type="button"
            className={`admin-btn ${activeTab === 'texts' ? 'primary' : 'secondary'}`}
            onClick={() => setActiveTab('texts')}
            style={{ fontSize: '12.5px', padding: '7px 14px' }}
          >
            🔤 Buttons & Text Customization
          </button>
          <button
            type="button"
            className={`admin-btn ${activeTab === 'socials' ? 'primary' : 'secondary'}`}
            onClick={() => setActiveTab('socials')}
            style={{ fontSize: '12.5px', padding: '7px 14px' }}
          >
            🌐 Social Media & WhatsApp
          </button>
          <button
            type="button"
            className={`admin-btn ${activeTab === 'payment' ? 'primary' : 'secondary'}`}
            onClick={() => setActiveTab('payment')}
            style={{ fontSize: '12.5px', padding: '7px 14px' }}
          >
            💳 G-Pay & UPI Scanner
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* ============================================================
            TAB 1: THEME & COLOR CUSTOMIZATION
           ============================================================ */}
        {activeTab === 'theme' && (
          <div className="admin-card">
            <h3 className="admin-card-title" style={{ marginBottom: '14px', fontSize: '16px' }}>
              🎨 Brand Color Palette & Presets
            </h3>

            {/* Pre-made Palettes */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#555', display: 'block', marginBottom: '8px' }}>
                One-Click Theme Presets:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                {THEME_PRESETS.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleApplyPreset(preset)}
                    style={{
                      border: '1px solid #ebd0e2',
                      borderRadius: '8px',
                      padding: '10px',
                      cursor: 'pointer',
                      background: '#faf5f8',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#333' }}>{preset.name}</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span style={{ width: '22px', height: '22px', borderRadius: '4px', background: preset.primaryColor }} title="Primary" />
                      <span style={{ width: '22px', height: '22px', borderRadius: '4px', background: preset.secondaryColor }} title="Secondary" />
                      <span style={{ width: '22px', height: '22px', borderRadius: '4px', background: preset.topBarBgColor }} title="Top Bar" />
                      <span style={{ width: '22px', height: '22px', borderRadius: '4px', background: preset.accentColor }} title="Accent" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="admin-form-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              
              {/* Primary Plum Color */}
              <div className="admin-form-group">
                <label>Primary Brand Color (Plum / Header / Titles)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="color" 
                    value={formData.primaryColor || '#74114e'}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    style={{ width: '44px', height: '38px', padding: '2px', borderRadius: '6px', border: '1px solid #ccc', cursor: 'pointer' }}
                  />
                  <input 
                    type="text" 
                    value={formData.primaryColor || '#74114e'}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    style={{ fontFamily: 'monospace', fontWeight: 600 }}
                  />
                </div>
              </div>

              {/* Secondary Leaf Green Color */}
              <div className="admin-form-group">
                <label>Secondary Accent (Sprout Green / Badges / CTAs)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="color" 
                    value={formData.secondaryColor || '#6db327'}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    style={{ width: '44px', height: '38px', padding: '2px', borderRadius: '6px', border: '1px solid #ccc', cursor: 'pointer' }}
                  />
                  <input 
                    type="text" 
                    value={formData.secondaryColor || '#6db327'}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    style={{ fontFamily: 'monospace', fontWeight: 600 }}
                  />
                </div>
              </div>

              {/* Top Bar Background */}
              <div className="admin-form-group">
                <label>Top Header Bar Background</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="color" 
                    value={formData.topBarBgColor || '#0a6637'}
                    onChange={(e) => handleChange('topBarBgColor', e.target.value)}
                    style={{ width: '44px', height: '38px', padding: '2px', borderRadius: '6px', border: '1px solid #ccc', cursor: 'pointer' }}
                  />
                  <input 
                    type="text" 
                    value={formData.topBarBgColor || '#0a6637'}
                    onChange={(e) => handleChange('topBarBgColor', e.target.value)}
                    style={{ fontFamily: 'monospace', fontWeight: 600 }}
                  />
                </div>
              </div>

              {/* Discount / Badge Accent */}
              <div className="admin-form-group">
                <label>Discount / Special Badge Accent</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="color" 
                    value={formData.accentColor || '#eb001b'}
                    onChange={(e) => handleChange('accentColor', e.target.value)}
                    style={{ width: '44px', height: '38px', padding: '2px', borderRadius: '6px', border: '1px solid #ccc', cursor: 'pointer' }}
                  />
                  <input 
                    type="text" 
                    value={formData.accentColor || '#eb001b'}
                    onChange={(e) => handleChange('accentColor', e.target.value)}
                    style={{ fontFamily: 'monospace', fontWeight: 600 }}
                  />
                </div>
              </div>

            </div>

            {/* Live Visual Preview Component */}
            <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Live Component Theme Preview
              </span>
              <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                
                {/* Preview Topbar Strip */}
                <div style={{ background: formData.topBarBgColor, padding: '8px 16px', borderRadius: '6px', color: '#fff', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>Top Bar Color</span>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Search Button</span>
                </div>

                {/* Primary Button */}
                <button 
                  type="button"
                  style={{ background: formData.primaryColor, color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer' }}
                >
                  Primary Brand Button
                </button>

                {/* Secondary Button */}
                <button 
                  type="button"
                  style={{ background: formData.secondaryColor, color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer' }}
                >
                  Action / Add to Cart
                </button>

                {/* Badge */}
                <span style={{ background: formData.accentColor, color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                  22% OFF
                </span>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================
            TAB 2: LOGO & BRANDING CUSTOMIZATION
           ============================================================ */}
        {activeTab === 'branding' && (
          <div className="admin-card">
            <h3 className="admin-card-title" style={{ marginBottom: '14px', fontSize: '16px' }}>
              🏷️ Logo, Branding & Hotline Settings
            </h3>

            {/* Brand Title & Tagline */}
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Website Brand Name *</label>
                <input 
                  type="text" 
                  value={formData.siteTitle !== undefined ? formData.siteTitle : ''}
                  onChange={(e) => handleChange('siteTitle', e.target.value)}
                  placeholder="e.g. The Onion Store"
                />
              </div>

              <div className="admin-form-group">
                <label>Brand Tagline / Header Slogan</label>
                <input 
                  type="text" 
                  value={formData.tagline !== undefined ? formData.tagline : ''}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  placeholder="e.g. Farm to Store — Direct from Punjab & Nashik Agro Fields"
                />
              </div>
            </div>

            {/* Logo Image Section with File Upload & URL */}
            <div style={{
              background: '#faf4f8',
              border: '1px solid #ebd0e2',
              borderRadius: '12px',
              padding: '16px',
              marginTop: '10px',
              marginBottom: '20px'
            }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#74114e', display: 'block', marginBottom: '8px' }}>
                🖼️ Store Logo Image
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {/* Logo Preview Box */}
                <div style={{
                  width: '180px',
                  height: '65px',
                  borderRadius: '8px',
                  background: '#1a1a1a',
                  border: '1px solid #ebd0e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px',
                  overflow: 'hidden'
                }}>
                  <img 
                    src={formData.customLogoUrl || defaultLogo} 
                    alt="Logo Preview" 
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <input 
                    type="file" 
                    ref={logoFileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleLogoUpload}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      type="button" 
                      className="admin-btn primary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => logoFileInputRef.current?.click()}
                    >
                      📁 Upload Logo From Computer
                    </button>
                    {formData.customLogoUrl && (
                      <button 
                        type="button" 
                        className="admin-btn secondary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => handleChange('customLogoUrl', '')}
                      >
                        Reset to Default Logo
                      </button>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', color: '#777' }}>
                    Recommended: PNG with transparent background or high-res JPG.
                  </span>
                </div>
              </div>

              {logoUploadError && (
                <div style={{ color: '#b91c1c', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
                  ⚠️ {logoUploadError}
                </div>
              )}

              <div className="admin-form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '12px', color: '#555' }}>
                  Or Paste Web Image URL (Leave empty to use default):
                </label>
                <input 
                  type="text" 
                  value={formData.customLogoUrl?.startsWith('data:') ? 'Custom Uploaded Logo (Base64)' : (formData.customLogoUrl || '')}
                  onChange={(e) => handleChange('customLogoUrl', e.target.value)}
                  placeholder="https://your-domain.com/logo.png or data:image/png;base64,..."
                  style={{ fontSize: '12px', padding: '8px 12px' }}
                />
              </div>
            </div>

            {/* Hotline & Header Phone Number Section */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              padding: '18px',
              marginTop: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📞 Header Hotline & Customer Support Phone
                </h4>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                  Updates "CALL US NOW" in header, mobile menu, and footer
                </span>
              </div>

              <p style={{ fontSize: '12.5px', color: '#475569', margin: '0 0 16px 0' }}>
                This phone number powers the prominent <strong>CALL US NOW</strong> button in the top navigation, the customer support popover dropdown, the mobile side drawer, and all direct click-to-call links.
              </p>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label style={{ fontWeight: 700, color: '#74114e' }}>
                    Call Us Now Hotline Phone Number *
                  </label>
                  <input 
                    type="text" 
                    required
                    value={formData.contactHotline !== undefined ? formData.contactHotline : '+91 98765 43210'}
                    onChange={(e) => handleChange('contactHotline', e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    style={{ fontWeight: 700, fontSize: '14px' }}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Customer Support Email</label>
                  <input 
                    type="email" 
                    value={formData.supportEmail !== undefined ? formData.supportEmail : ''}
                    onChange={(e) => handleChange('supportEmail', e.target.value)}
                    placeholder="e.g. support@theonionstore.in"
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Customer Care Operating Hours</label>
                <input 
                  type="text" 
                  value={formData.workingHours !== undefined ? formData.workingHours : ''}
                  onChange={(e) => handleChange('workingHours', e.target.value)}
                  placeholder="e.g. Mon - Sun: 7:00 AM - 9:30 PM"
                />
              </div>

              {/* Real-Time Live Header Call Pill Preview */}
              <div style={{ marginTop: '16px', padding: '14px', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>
                  Live Header Pill Preview:
                </span>
                
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1.5px solid #74114e', borderRadius: '30px', padding: '5px 14px 5px 6px', background: '#fff', boxShadow: '0 2px 8px rgba(116, 17, 78, 0.08)' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f0fdf4', border: '1.5px solid #6db327', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#16a34a" strokeWidth="2.5">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                    <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#555', letterSpacing: '0.5px' }}>CALL US NOW :</span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#74114e' }}>{formData.contactHotline || '+91 98765 43210'}</span>
                  </div>
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="#555" style={{ marginLeft: '4px' }}>
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ============================================================
            TAB 3: BUTTON & TEXT CUSTOMIZATION
           ============================================================ */}
        {activeTab === 'texts' && (
          <div className="admin-card">
            <h3 className="admin-card-title" style={{ marginBottom: '14px', fontSize: '16px' }}>
              🔤 Button Labels, Announcements & Hotlines
            </h3>

            <div className="admin-form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ margin: 0 }}>Top Announcement Bar Message</label>
                <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.showAnnouncement !== false}
                    onChange={(e) => handleChange('showAnnouncement', e.target.checked)}
                  />
                  <span>Show Announcement Bar</span>
                </label>
              </div>
              <input 
                type="text" 
                value={formData.announcementText !== undefined ? formData.announcementText : ''}
                onChange={(e) => handleChange('announcementText', e.target.value)}
                placeholder="e.g. ⚡ Same-Day Express Delivery Across Amritsar, Jalandhar, Batala & Gurdaspur!"
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Primary Hero CTA Button Text</label>
                <input 
                  type="text" 
                  value={formData.heroCtaText !== undefined ? formData.heroCtaText : ''}
                  onChange={(e) => handleChange('heroCtaText', e.target.value)}
                  placeholder="e.g. SHOP ONIONS NOW"
                />
              </div>

              <div className="admin-form-group">
                <label>Central Customer Hotline Phone</label>
                <input 
                  type="text" 
                  value={formData.contactHotline !== undefined ? formData.contactHotline : ''}
                  onChange={(e) => handleChange('contactHotline', e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Support Email Address</label>
                <input 
                  type="email" 
                  value={formData.supportEmail !== undefined ? formData.supportEmail : ''}
                  onChange={(e) => handleChange('supportEmail', e.target.value)}
                  placeholder="e.g. support@theonionstore.in"
                />
              </div>

              <div className="admin-form-group">
                <label>Customer Care Operating Hours</label>
                <input 
                  type="text" 
                  value={formData.workingHours !== undefined ? formData.workingHours : ''}
                  onChange={(e) => handleChange('workingHours', e.target.value)}
                  placeholder="e.g. Mon - Sun: 7:00 AM - 9:30 PM"
                />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 4: SOCIAL MEDIA & WHATSAPP LINKS
           ============================================================ */}
        {activeTab === 'socials' && (
          <div className="admin-card">
            <h3 className="admin-card-title" style={{ marginBottom: '14px', fontSize: '16px' }}>
              🌐 Social Media Handles & WhatsApp Integration
            </h3>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Facebook Page URL</label>
                <input 
                  type="url" 
                  value={formData.socialLinks?.facebook || ''}
                  onChange={(e) => handleNestedChange('socialLinks', 'facebook', e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>

              <div className="admin-form-group">
                <label>Instagram Profile URL</label>
                <input 
                  type="url" 
                  value={formData.socialLinks?.instagram || ''}
                  onChange={(e) => handleNestedChange('socialLinks', 'instagram', e.target.value)}
                  placeholder="https://instagram.com/yourhandle"
                />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Twitter / X Profile URL</label>
                <input 
                  type="url" 
                  value={formData.socialLinks?.twitter || ''}
                  onChange={(e) => handleNestedChange('socialLinks', 'twitter', e.target.value)}
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>

              <div className="admin-form-group">
                <label>Pinterest Profile URL</label>
                <input 
                  type="url" 
                  value={formData.socialLinks?.pinterest || ''}
                  onChange={(e) => handleNestedChange('socialLinks', 'pinterest', e.target.value)}
                  placeholder="https://pinterest.com/yourboard"
                />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>YouTube Channel URL</label>
                <input 
                  type="url" 
                  value={formData.socialLinks?.youtube || ''}
                  onChange={(e) => handleNestedChange('socialLinks', 'youtube', e.target.value)}
                  placeholder="https://youtube.com/@channel"
                />
              </div>

              <div className="admin-form-group">
                <label>WhatsApp Direct Chat URL / Number</label>
                <input 
                  type="text" 
                  value={formData.socialLinks?.whatsapp || ''}
                  onChange={(e) => handleNestedChange('socialLinks', 'whatsapp', e.target.value)}
                  placeholder="https://wa.me/919876543210"
                />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 5: G-PAY & UPI PAYMENT SCANNER
           ============================================================ */}
        {activeTab === 'payment' && (
          <div className="admin-card">
            <h3 className="admin-card-title" style={{ marginBottom: '14px', fontSize: '16px' }}>
              💳 Storefront Google Pay & UPI QR Code Scanner
            </h3>
            <p style={{ fontSize: '13px', color: '#666', margin: '-8px 0 16px 0' }}>
              Configure the default G-Pay / PhonePe / Paytm scanner image and UPI merchant details displayed during customer checkout.
            </p>

            {/* QR Upload & Preview Box */}
            <div style={{
              background: '#faf4f8',
              border: '1.5px dashed #74114e',
              borderRadius: '12px',
              padding: '18px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <label style={{ fontSize: '13px', fontWeight: 800, color: '#74114e', display: 'block', marginBottom: '8px' }}>
                📸 Upload Google Pay / UPI QR Scanner Image *
              </label>

              {/* QR Image Preview */}
              <div style={{
                width: '170px',
                height: '170px',
                margin: '0 auto 12px',
                borderRadius: '10px',
                border: '2px solid #ebd0e2',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
              }}>
                <img 
                  src={formData.payment?.qrScannerImage || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                    `upi://pay?pa=${formData.payment?.upiId || 'theonionstore@upi'}&pn=${encodeURIComponent(formData.payment?.payeeName || 'The Onion Store')}&cu=INR`
                  )}`} 
                  alt="G-Pay Scanner QR Code"
                  style={{ maxWidth: '92%', maxHeight: '92%', objectFit: 'contain' }}
                />
              </div>

              {formData.payment?.qrScannerImage ? (
                <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700, marginBottom: '10px' }}>
                  ✓ Custom QR Scanner Image Active
                </div>
              ) : (
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '10px' }}>
                  ℹ️ Using auto-generated UPI QR code. Upload your official G-Pay scanner photo/screenshot below.
                </div>
              )}

              {/* Upload Buttons */}
              <input 
                type="file" 
                ref={qrFileInputRef} 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handlePaymentQrUpload} 
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="admin-btn primary"
                  style={{ padding: '7px 14px', fontSize: '12px' }}
                  onClick={() => qrFileInputRef.current?.click()}
                >
                  📁 Upload Scanner Photo
                </button>
                {formData.payment?.qrScannerImage && (
                  <button
                    type="button"
                    className="admin-btn secondary"
                    style={{ padding: '7px 14px', fontSize: '12px' }}
                    onClick={() => handleNestedChange('payment', 'qrScannerImage', '')}
                  >
                    Reset Scanner
                  </button>
                )}
              </div>

              {qrUploadError && (
                <div style={{ color: '#b91c1c', fontSize: '12px', fontWeight: 600, marginTop: '8px' }}>
                  ⚠️ {qrUploadError}
                </div>
              )}
            </div>

            {/* QR Image URL */}
            <div className="admin-form-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: '#555' }}>
                Or Direct Image URL (HTTPS link or Base64 string):
              </label>
              <input 
                type="text" 
                value={formData.payment?.qrScannerImage?.startsWith('data:') ? 'Custom Uploaded Scanner File (Base64)' : (formData.payment?.qrScannerImage || '')}
                onChange={(e) => handleNestedChange('payment', 'qrScannerImage', e.target.value)}
                placeholder="https://example.com/gpay-scanner.png"
                style={{ fontSize: '12.5px', padding: '8px 12px' }}
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label style={{ fontWeight: 700, color: '#74114e' }}>
                  UPI ID / Virtual Payment Address (VPA) *
                </label>
                <input 
                  type="text" 
                  value={formData.payment?.upiId !== undefined ? formData.payment.upiId : 'theonionstore@upi'}
                  onChange={(e) => handleNestedChange('payment', 'upiId', e.target.value)}
                  placeholder="e.g. theonionstore@okaxis"
                  style={{ fontWeight: 700, fontSize: '13.5px' }}
                />
              </div>

              <div className="admin-form-group">
                <label style={{ fontWeight: 700 }}>
                  Merchant / Payee Name *
                </label>
                <input 
                  type="text" 
                  value={formData.payment?.payeeName !== undefined ? formData.payment.payeeName : 'The Onion Store Punjab Ltd'}
                  onChange={(e) => handleNestedChange('payment', 'payeeName', e.target.value)}
                  placeholder="e.g. The Onion Store Punjab Ltd"
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>Customer Payment Instructions & Notes</label>
              <textarea 
                rows="3" 
                value={formData.payment?.instructions !== undefined ? formData.payment.instructions : 'Scan with Google Pay, PhonePe, Paytm or BHIM UPI to make instant payment. Share screenshot on WhatsApp for fast dispatch.'}
                onChange={(e) => handleNestedChange('payment', 'instructions', e.target.value)}
                placeholder="Enter customer checkout instructions..."
              ></textarea>
            </div>
          </div>
        )}

        {/* Floating / Bottom Save Bar */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button 
            type="submit" 
            className="admin-btn primary"
            style={{ padding: '10px 24px', fontSize: '14px' }}
          >
            {savedSuccess ? '✓ All Changes Saved & Synced!' : 'Save & Publish Customizations'}
          </button>
        </div>

      </form>

    </div>
  )
}
