import React, { useState, useEffect } from 'react'
import { clearCart } from './cartStore'
import { createCustomerOrder } from './admin/adminStore'

export default function GPayModal({ isOpen, onClose, cartItems = [], cartTotal = 0, store }) {
  if (!isOpen) return null

  const branches = store?.branches || []
  const globalPayment = store?.settings?.payment || {}
  const settings = store?.settings || {}

  const [selectedBranchId, setSelectedBranchId] = useState('all')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [txnRef, setTxnRef] = useState('')
  const [copiedUpi, setCopiedUpi] = useState(false)
  const [activeTab, setActiveTab] = useState('gpay') // 'gpay' | 'cod'
  const [isSuccess, setIsSuccess] = useState(false)

  // Determine active branch or global payment config
  const selectedBranch = branches.find(b => b.id === selectedBranchId)
  
  const activeQrImage = selectedBranch 
    ? (selectedBranch.qrScannerImage || selectedBranch.payment?.qrScannerImage || globalPayment.qrScannerImage) 
    : globalPayment.qrScannerImage

  const activeUpiId = selectedBranch 
    ? (selectedBranch.upiId || selectedBranch.payment?.upiId || globalPayment.upiId || 'theonionstore@upi') 
    : (globalPayment.upiId || 'theonionstore@upi')

  const activePayee = selectedBranch 
    ? (selectedBranch.payeeName || selectedBranch.payment?.payeeName || `${selectedBranch.name}`) 
    : (globalPayment.payeeName || (settings.siteTitle || 'The Onion Store Punjab Ltd'))

  const activeInstructions = selectedBranch 
    ? (selectedBranch.instructions || selectedBranch.payment?.instructions || globalPayment.instructions) 
    : (globalPayment.instructions || 'Scan with Google Pay, PhonePe, Paytm, or BHIM UPI. Enter exact cart total and confirm on WhatsApp for fast dispatch.')

  const targetPhone = selectedBranch?.phone || settings.contactHotline || '+91 98765 43210'

  // Dynamic fallback SVG QR Code if no image has been uploaded yet
  const dynamicFallbackQr = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    `upi://pay?pa=${activeUpiId}&pn=${encodeURIComponent(activePayee)}&am=${cartTotal.toFixed(2)}&cu=INR`
  )}`

  // Direct Mobile UPI Intent Link
  const upiIntentUrl = `upi://pay?pa=${activeUpiId}&pn=${encodeURIComponent(activePayee)}&am=${cartTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent('The Onion Store Order')}`

  const copyUpi = () => {
    navigator.clipboard.writeText(activeUpiId)
    setCopiedUpi(true)
    setTimeout(() => setCopiedUpi(false), 2000)
  }

  const handlePlaceOrder = (e) => {
    e.preventDefault()

    const branchTitle = selectedBranch ? `${selectedBranch.name} (${selectedBranch.city})` : 'Central Punjab Distribution Hub'
    const paymentMethodText = activeTab === 'gpay' ? `Google Pay / UPI Transfer (Txn Ref: ${txnRef || 'Shared on WhatsApp'})` : 'Cash on Delivery (COD)'

    const orderSlip = 
`🧅 *NEW ORDER — THE ONION STORE* 🧅
------------------------------------------
📦 *Order Items:*
${cartItems.map(item => `• ${item.quantity}x ${item.name} (${item.weight}) — ₹${(item.price * item.quantity).toFixed(2)}`).join('\n')}

💰 *Total Amount:* ₹${cartTotal.toFixed(2)}
💳 *Payment Mode:* ${paymentMethodText}
📍 *Fulfillment Hub:* ${branchTitle}

👤 *Customer Details:*
• Name: ${customerName || 'Customer'}
• Phone: ${customerPhone || 'Not provided'}
• Address: ${deliveryAddress || 'Pending confirmation'}
${txnRef ? `• UPI Transaction UTR: ${txnRef}` : ''}
------------------------------------------
⚡ *Please confirm same-day delivery dispatch!*`

    const cleanPhone = targetPhone.replace(/\D/g, '')
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(orderSlip)}`

    // Store order into admin backend / dashboard database
    createCustomerOrder({
      customerName: customerName || 'Customer',
      customerPhone: customerPhone || 'Not provided',
      deliveryAddress: deliveryAddress || 'Pending confirmation',
      branchId: selectedBranchId === 'all' ? 'amritsar' : selectedBranchId,
      packSize: cartItems.map(i => `${i.quantity}x ${i.weight}`).join(', '),
      quantity: cartItems.reduce((sum, i) => sum + i.quantity, 0),
      totalAmount: Number(cartTotal.toFixed(2)),
      paymentMethod: paymentMethodText,
      status: 'Pending',
      notes: `Items: ${cartItems.map(i => `${i.quantity}x ${i.name} (${i.weight})`).join(', ')}${txnRef ? ` | UTR: ${txnRef}` : ''}`
    })

    // Clear cart
    clearCart()
    setIsSuccess(true)

    setTimeout(() => {
      window.open(whatsappUrl, '_blank')
      onClose()
    }, 1200)
  }

  return (
    <div className="gpay-modal-overlay" onClick={onClose} style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(5px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      overflowY: 'auto'
    }}>
      <div 
        className="gpay-modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35)',
          border: '1px solid #ebd0e2',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        
        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(135deg, #74114e 0%, #46062d 100%)',
          color: '#ffffff',
          padding: '16px 20px',
          borderRadius: '19px 19px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>💳</span>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#ffffff' }}>
                Quick Checkout & Payment
              </h3>
            </div>
            <span style={{ fontSize: '11.5px', color: '#f1d7e7', marginTop: '2px', display: 'block' }}>
              Instant G-Pay Scanner & Express Same-Day Farm Delivery
            </span>
          </div>

          <button 
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px' }}>
          
          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#74114e', margin: '0 0 8px 0' }}>
                Order Prepared Successfully!
              </h3>
              <p style={{ fontSize: '13.5px', color: '#555', margin: '0 0 16px 0' }}>
                Redirecting you to WhatsApp to dispatch your order with <strong>{activePayee}</strong>...
              </p>
              <div style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid #74114e', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : (
            <form onSubmit={handlePlaceOrder}>
              
              {/* Order Summary Ribbon */}
              <div style={{
                background: '#faf4f8',
                border: '1px solid #ebd0e2',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#777', textTransform: 'uppercase', fontWeight: 700 }}>
                    Items in Cart ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} packs):
                  </span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {cartItems.map(i => `${i.quantity}x ${i.weight}`).join(', ')}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: '#777', textTransform: 'uppercase', fontWeight: 700 }}>Total To Pay:</span>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#74114e' }}>
                    ₹{cartTotal.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Regional Branch Hub Selector */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#444', display: 'block', marginBottom: '6px' }}>
                  📍 Select Your Nearest Delivery Branch Hub:
                </label>
                <select 
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #74114e',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: '#fff',
                    color: '#2b041c'
                  }}
                >
                  <option value="all">🏢 Central Punjab Distribution Hub (All Cities)</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>
                      📍 {b.city} Hub — {b.name} ({b.phone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method Selector Tabs */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('gpay')}
                  style={{
                    flex: 1,
                    padding: '10px 8px',
                    borderRadius: '10px',
                    border: activeTab === 'gpay' ? '2px solid #74114e' : '1px solid #d8cbd5',
                    background: activeTab === 'gpay' ? '#fdf2f8' : '#fafafa',
                    color: activeTab === 'gpay' ? '#74114e' : '#555',
                    fontWeight: 800,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s'
                  }}
                >
                  <span>⚡ Scan & Pay (G-Pay / UPI)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('cod')}
                  style={{
                    flex: 1,
                    padding: '10px 8px',
                    borderRadius: '10px',
                    border: activeTab === 'cod' ? '2px solid #0a6637' : '1px solid #d8cbd5',
                    background: activeTab === 'cod' ? '#f0fdf4' : '#fafafa',
                    color: activeTab === 'cod' ? '#0a6637' : '#555',
                    fontWeight: 800,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s'
                  }}
                >
                  <span>💵 Cash On Delivery (COD)</span>
                </button>
              </div>

              {/* TAB 1: G-PAY & UPI SCANNER CONTAINER */}
              {activeTab === 'gpay' && (
                <div style={{
                  border: '1.5px solid #74114e',
                  borderRadius: '14px',
                  padding: '16px',
                  background: '#faf4f8',
                  marginBottom: '18px'
                }}>
                  {/* UPI Badges */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', background: '#e8f0fe', color: '#1a73e8', padding: '3px 8px', borderRadius: '5px', fontWeight: 800 }}>Google Pay</span>
                    <span style={{ fontSize: '11px', background: '#ede7f6', color: '#5e35b1', padding: '3px 8px', borderRadius: '5px', fontWeight: 800 }}>PhonePe</span>
                    <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0284c7', padding: '3px 8px', borderRadius: '5px', fontWeight: 800 }}>Paytm</span>
                    <span style={{ fontSize: '11px', background: '#f0fdf4', color: '#16a34a', padding: '3px 8px', borderRadius: '5px', fontWeight: 800 }}>BHIM UPI</span>
                  </div>

                  {/* QR Image Box */}
                  <div style={{
                    width: '210px',
                    height: '210px',
                    margin: '0 auto 12px',
                    background: '#ffffff',
                    borderRadius: '12px',
                    border: '2px solid #74114e',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(116, 17, 78, 0.15)',
                    position: 'relative'
                  }}>
                    {/* Scanner corner brackets */}
                    <div style={{ position: 'absolute', top: '4px', left: '4px', width: '14px', height: '14px', borderTop: '2.5px solid #74114e', borderLeft: '2.5px solid #74114e' }} />
                    <div style={{ position: 'absolute', top: '4px', right: '4px', width: '14px', height: '14px', borderTop: '2.5px solid #74114e', borderRight: '2.5px solid #74114e' }} />
                    <div style={{ position: 'absolute', bottom: '4px', left: '4px', width: '14px', height: '14px', borderBottom: '2.5px solid #74114e', borderLeft: '2.5px solid #74114e' }} />
                    <div style={{ position: 'absolute', bottom: '4px', right: '4px', width: '14px', height: '14px', borderBottom: '2.5px solid #74114e', borderRight: '2.5px solid #74114e' }} />

                    <img 
                      src={activeQrImage || dynamicFallbackQr} 
                      alt="Google Pay Scanner QR"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  </div>

                  {/* Payee Details & Copy Button */}
                  <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#1a1a1a', display: 'block' }}>
                      {activePayee}
                    </span>

                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '4px', background: '#ffffff', padding: '5px 12px', borderRadius: '8px', border: '1px solid #ebd0e2' }}>
                      <code style={{ fontSize: '12.5px', fontWeight: 700, color: '#74114e' }}>
                        {activeUpiId}
                      </code>
                      <button 
                        type="button" 
                        onClick={copyUpi} 
                        style={{ background: 'none', border: 'none', color: '#74114e', fontWeight: 800, fontSize: '11px', cursor: 'pointer' }}
                      >
                        {copiedUpi ? '✓ Copied!' : '📋 Copy UPI'}
                      </button>
                    </div>
                  </div>

                  {/* Direct Mobile Pay Link */}
                  <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <a 
                      href={upiIntentUrl}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#74114e',
                        color: '#ffffff',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        textDecoration: 'none'
                      }}
                    >
                      📲 Click to Pay on Mobile via UPI App
                    </a>
                  </div>

                  <p style={{ fontSize: '11px', color: '#666', textAlign: 'center', margin: 0 }}>
                    {activeInstructions}
                  </p>
                </div>
              )}

              {/* Delivery Details Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#444', display: 'block', marginBottom: '3px' }}>
                      Your Full Name *
                    </label>
                    <input 
                      type="text" 
                      required 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Navjot Singh"
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '12.5px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#444', display: 'block', marginBottom: '3px' }}>
                      WhatsApp Phone Number *
                    </label>
                    <input 
                      type="tel" 
                      required 
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '12.5px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#444', display: 'block', marginBottom: '3px' }}>
                    Delivery Address & Landmark *
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="e.g. House #142, Mall Road, Model Town, Amritsar"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '12.5px' }}
                  />
                </div>

                {activeTab === 'gpay' && (
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#444', display: 'block', marginBottom: '3px' }}>
                      UPI Transaction ID / UTR / Reference (Optional):
                    </label>
                    <input 
                      type="text" 
                      value={txnRef}
                      onChange={(e) => setTxnRef(e.target.value)}
                      placeholder="e.g. 426189912044 or share screenshot in WhatsApp chat"
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '12px' }}
                    />
                  </div>
                )}
              </div>

              {/* Submit & WhatsApp Button */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(37, 211, 102, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'transform 0.15s'
                }}
              >
                <span>📱 Complete Order & Send WhatsApp ({selectedBranch ? selectedBranch.city : 'Punjab'}) &rarr;</span>
              </button>

              <span style={{ fontSize: '11px', color: '#777', textAlign: 'center', display: 'block', marginTop: '8px' }}>
                🔒 Direct encrypted connection to {targetPhone} &bull; 100% Farm Fresh Guarantee
              </span>

            </form>
          )}

        </div>

      </div>
    </div>
  )
}
