import React, { useState, useRef } from 'react'

export default function PaymentScannerView({ store, user, onSave }) {
  const isSuperAdmin = user.role === 'admin'
  const [selectedTarget, setSelectedTarget] = useState(
    isSuperAdmin ? 'global' : (user.branchId || 'amritsar')
  )
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [copiedUpi, setCopiedUpi] = useState(false)
  const fileInputRef = useRef(null)

  // Retrieve current active configuration based on selectedTarget ('global' or branchId)
  const getActiveConfig = (target) => {
    if (target === 'global') {
      const globalPayment = store.settings?.payment || {}
      return {
        qrScannerImage: globalPayment.qrScannerImage || '',
        upiId: globalPayment.upiId || 'theonionstore@upi',
        payeeName: globalPayment.payeeName || (store.settings?.siteTitle || 'The Onion Store Punjab Ltd'),
        instructions: globalPayment.instructions || 'Scan with Google Pay, PhonePe, Paytm or BHIM UPI to make instant payment. Share screenshot on WhatsApp for fast dispatch.',
        enabled: globalPayment.enabled !== false
      }
    } else {
      const branch = store.branches?.find(b => b.id === target) || {}
      const branchPayment = branch.payment || {}
      return {
        qrScannerImage: branch.qrScannerImage || branchPayment.qrScannerImage || '',
        upiId: branch.upiId || branchPayment.upiId || `${target}.onions@upi`,
        payeeName: branch.payeeName || branchPayment.payeeName || `${branch.name || target.toUpperCase()} Hub`,
        instructions: branch.instructions || branchPayment.instructions || `Scan to pay direct to ${branch.name || target.toUpperCase()} distribution hub. Same-day delivery will be dispatched immediately.`,
        enabled: branchPayment.enabled !== false
      }
    }
  }

  const [formData, setFormData] = useState(getActiveConfig(selectedTarget))

  // Switch target (Global vs Specific Branch)
  const handleTargetChange = (newTarget) => {
    setSelectedTarget(newTarget)
    setFormData(getActiveConfig(newTarget))
    setUploadError('')
  }

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle QR scanner image upload via canvas compression
  const handleQrUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, JPEG, WebP).')
      return
    }

    setUploadError('')
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
        handleFieldChange('qrScannerImage', compressedDataUrl)
      }
      img.onerror = () => {
        setUploadError('Failed to process image file.')
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const handleSave = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    let updatedStore = { ...store }

    if (selectedTarget === 'global') {
      updatedStore = {
        ...updatedStore,
        settings: {
          ...updatedStore.settings,
          payment: {
            ...formData
          }
        }
      }
    } else {
      const updatedBranches = (updatedStore.branches || []).map(b => {
        if (b.id === selectedTarget) {
          return {
            ...b,
            qrScannerImage: formData.qrScannerImage,
            upiId: formData.upiId,
            payeeName: formData.payeeName,
            payment: {
              ...formData
            }
          }
        }
        return b
      })
      updatedStore = {
        ...updatedStore,
        branches: updatedBranches
      }
    }

    onSave(updatedStore)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const copyUpiToClipboard = () => {
    if (formData.upiId) {
      navigator.clipboard.writeText(formData.upiId)
      setCopiedUpi(true)
      setTimeout(() => setCopiedUpi(false), 2000)
    }
  }

  // Dynamic SVG QR code generator fallback if no custom screenshot is uploaded
  const qrFallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    `upi://pay?pa=${formData.upiId}&pn=${encodeURIComponent(formData.payeeName)}&cu=INR`
  )}`

  return (
    <div className="admin-payment-scanner-view">
      
      {/* Header Card */}
      <div className="admin-card" style={{ marginBottom: '20px' }}>
        <div className="admin-card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              💳 Google Pay & UPI QR Scanner Dashboard
            </h2>
            <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>
              Upload your official G-Pay / PhonePe / Paytm scanner QR code image, configure UPI IDs, and enable 1-click customer scan-and-pay at checkout.
            </p>
          </div>

          <button 
            type="button" 
            className="admin-btn primary" 
            onClick={handleSave}
            style={{ padding: '8px 20px', fontSize: '13px' }}
          >
            {saveSuccess ? '✓ Saved & Synced!' : 'Save Payment Scanner'}
          </button>
        </div>

        {/* Target Switcher (Super Admin can switch between Global and any Branch) */}
        {isSuperAdmin && (
          <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #ebd0e2', paddingTop: '14px', marginTop: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#555', marginRight: '4px' }}>
              Configure QR Code For:
            </span>
            <button
              type="button"
              className={`admin-btn ${selectedTarget === 'global' ? 'primary' : 'secondary'}`}
              onClick={() => handleTargetChange('global')}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              🌐 Global Storefront Default
            </button>
            {(store.branches || []).map(b => (
              <button
                key={b.id}
                type="button"
                className={`admin-btn ${selectedTarget === b.id ? 'primary' : 'secondary'}`}
                onClick={() => handleTargetChange(b.id)}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                📍 {b.city} Branch Hub
              </button>
            ))}
          </div>
        )}

        {!isSuperAdmin && (
          <div style={{ marginTop: '10px', padding: '8px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0a6637' }}>
              📍 Managing G-Pay Scanner for {user.branchName || 'Your Branch'}
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        
        {/* LEFT COLUMN: Upload & Form Settings */}
        <div className="admin-card">
          <h3 className="admin-card-title" style={{ marginBottom: '16px', fontSize: '15px' }}>
            ⚙️ Scanner Image & Merchant Details
          </h3>

          <form onSubmit={handleSave}>
            {/* 1. QR Code Upload Box */}
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
                width: '180px',
                height: '180px',
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
                  src={formData.qrScannerImage || qrFallbackUrl} 
                  alt="G-Pay Scanner QR Code"
                  style={{ maxWidth: '92%', maxHeight: '92%', objectFit: 'contain' }}
                />
              </div>

              {formData.qrScannerImage ? (
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
                ref={fileInputRef} 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleQrUpload} 
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="admin-btn primary"
                  style={{ padding: '7px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  📁 Upload Scanner Photo
                </button>
                {formData.qrScannerImage && (
                  <button
                    type="button"
                    className="admin-btn secondary"
                    style={{ padding: '7px 14px', fontSize: '12px' }}
                    onClick={() => handleFieldChange('qrScannerImage', '')}
                  >
                    Remove Image
                  </button>
                )}
              </div>

              {uploadError && (
                <div style={{ color: '#b91c1c', fontSize: '12px', fontWeight: 600, marginTop: '8px' }}>
                  ⚠️ {uploadError}
                </div>
              )}
            </div>

            {/* 2. Image URL Input */}
            <div className="admin-form-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: '#555' }}>
                Or Direct Image URL (HTTPS link or Base64 string):
              </label>
              <input 
                type="text" 
                value={formData.qrScannerImage.startsWith('data:') ? 'Custom Uploaded Scanner File (Base64)' : formData.qrScannerImage}
                onChange={(e) => handleFieldChange('qrScannerImage', e.target.value)}
                placeholder="https://example.com/gpay-scanner.png"
                style={{ fontSize: '12.5px', padding: '8px 12px' }}
              />
            </div>

            {/* 3. UPI ID / VPA */}
            <div className="admin-form-group">
              <label style={{ fontWeight: 700, color: '#74114e' }}>
                UPI ID / Virtual Payment Address (VPA) *
              </label>
              <input 
                type="text" 
                required 
                value={formData.upiId}
                onChange={(e) => handleFieldChange('upiId', e.target.value)}
                placeholder="e.g. theonionstore@okaxis, 9876543210@paytm"
                style={{ fontWeight: 700, fontSize: '13.5px' }}
              />
              <span style={{ fontSize: '11px', color: '#777', marginTop: '3px', display: 'block' }}>
                Customers can tap to copy this UPI ID to pay from any app.
              </span>
            </div>

            {/* 4. Payee Name */}
            <div className="admin-form-group">
              <label style={{ fontWeight: 700 }}>
                Merchant / Payee Name (As displayed in Bank/UPI) *
              </label>
              <input 
                type="text" 
                required 
                value={formData.payeeName}
                onChange={(e) => handleFieldChange('payeeName', e.target.value)}
                placeholder="e.g. The Onion Store Punjab Ltd"
              />
            </div>

            {/* 5. Payment Instructions */}
            <div className="admin-form-group">
              <label>Customer Checkout Payment Instructions</label>
              <textarea 
                rows="3" 
                value={formData.instructions}
                onChange={(e) => handleFieldChange('instructions', e.target.value)}
                placeholder="Enter instructions for customers..."
              ></textarea>
            </div>

            {/* 6. Enable Toggle */}
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                id="enableScanner"
                checked={formData.enabled !== false}
                onChange={(e) => handleFieldChange('enabled', e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="enableScanner" style={{ margin: 0, fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                Show G-Pay & UPI QR Scanner Option at Storefront Checkout
              </label>
            </div>

            <div style={{ marginTop: '20px' }}>
              <button type="submit" className="admin-btn primary" style={{ width: '100%', padding: '10px' }}>
                {saveSuccess ? '✓ Saved Successfully!' : 'Save & Publish Scanner Settings'}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Live Customer Checkout Preview */}
        <div className="admin-card" style={{ background: '#fdfbfe' }}>
          <h3 className="admin-card-title" style={{ marginBottom: '16px', fontSize: '15px' }}>
            📱 Customer Live Checkout Modal Preview
          </h3>

          <div style={{
            background: '#ffffff',
            border: '2px solid #74114e',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 8px 30px rgba(116, 17, 78, 0.12)',
            maxWidth: '380px',
            margin: '0 auto'
          }}>
            {/* Header with UPI apps badges */}
            <div style={{ textAlign: 'center', borderBottom: '1px solid #f0e2ec', paddingBottom: '12px', marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#74114e', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                INSTANT SCAN & PAY
              </span>
              <h4 style={{ fontSize: '16px', fontWeight: 900, color: '#1a1a1a', margin: '4px 0 6px 0' }}>
                Pay with Google Pay / UPI
              </h4>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '10.5px', background: '#e8f0fe', color: '#1a73e8', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>GPay</span>
                <span style={{ fontSize: '10.5px', background: '#ede7f6', color: '#5e35b1', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>PhonePe</span>
                <span style={{ fontSize: '10.5px', background: '#e0f2fe', color: '#0284c7', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>Paytm</span>
                <span style={{ fontSize: '10.5px', background: '#f0fdf4', color: '#16a34a', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>BHIM</span>
              </div>
            </div>

            {/* Total Amount Badge */}
            <div style={{ textAlign: 'center', marginBottom: '14px', background: '#faf4f8', padding: '10px', borderRadius: '10px', border: '1px solid #ebd0e2' }}>
              <span style={{ fontSize: '11.5px', color: '#666', fontWeight: 600 }}>Total Order Amount:</span>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#74114e', lineHeight: 1.2 }}>
                ₹175.00
              </div>
              <span style={{ fontSize: '10px', color: '#0a6637', fontWeight: 700 }}>
                ⚡ 100% Secure Instant UPI Transfer
              </span>
            </div>

            {/* QR Scanner Display Frame */}
            <div style={{
              width: '210px',
              height: '210px',
              margin: '0 auto 14px',
              background: '#ffffff',
              borderRadius: '12px',
              border: '2px solid #74114e',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              boxShadow: '0 4px 16px rgba(116, 17, 78, 0.15)'
            }}>
              {/* Corner scan target brackets */}
              <div style={{ position: 'absolute', top: '4px', left: '4px', width: '12px', height: '12px', borderTop: '2px solid #74114e', borderLeft: '2px solid #74114e' }} />
              <div style={{ position: 'absolute', top: '4px', right: '4px', width: '12px', height: '12px', borderTop: '2px solid #74114e', borderRight: '2px solid #74114e' }} />
              <div style={{ position: 'absolute', bottom: '4px', left: '4px', width: '12px', height: '12px', borderBottom: '2px solid #74114e', borderLeft: '2px solid #74114e' }} />
              <div style={{ position: 'absolute', bottom: '4px', right: '4px', width: '12px', height: '12px', borderBottom: '2px solid #74114e', borderRight: '2px solid #74114e' }} />

              <img 
                src={formData.qrScannerImage || qrFallbackUrl} 
                alt="G-Pay Live Preview"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </div>

            {/* Payee Info & Copy UPI ID */}
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <strong style={{ fontSize: '13px', color: '#1a1a1a', display: 'block' }}>
                {formData.payeeName}
              </strong>
              
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '6px', background: '#f1e4ec', padding: '4px 10px', borderRadius: '6px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#74114e', fontFamily: 'monospace' }}>
                  {formData.upiId}
                </span>
                <button
                  type="button"
                  onClick={copyUpiToClipboard}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#74114e', fontWeight: 800 }}
                  title="Copy UPI ID"
                >
                  {copiedUpi ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
            </div>

            {/* Customer Instruction Tip */}
            <p style={{ fontSize: '11px', color: '#666', textAlign: 'center', margin: '0 0 14px 0', lineHeight: 1.4 }}>
              {formData.instructions}
            </p>

            {/* WhatsApp Order Dispatch Button */}
            <button
              type="button"
              style={{
                width: '100%',
                padding: '10px',
                background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 3px 10px rgba(37, 211, 102, 0.3)'
              }}
            >
              📱 Confirm & Send on WhatsApp &rarr;
            </button>
          </div>
        </div>

      </div>

    </div>
  )
}
