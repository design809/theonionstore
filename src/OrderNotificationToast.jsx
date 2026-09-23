import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './OrderNotificationToast.css'

export default function OrderNotificationToast() {
  const [toasts, setToasts] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const handleNotification = (e) => {
      const data = e.detail
      if (!data || !data.order) return

      const toastId = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
      const newToast = {
        id: toastId,
        order: data.order,
        isTest: !!data.isTest,
        receivedAt: data.receivedAt || new Date().toISOString(),
        isDismissing: false
      }

      setToasts((prev) => [newToast, ...prev].slice(0, 3)) // keep at most 3 simultaneous

      // Auto dismiss after 8 seconds
      setTimeout(() => {
        dismissToast(toastId)
      }, 8000)
    }

    window.addEventListener('onion_order_notification', handleNotification)
    return () => {
      window.removeEventListener('onion_order_notification', handleNotification)
    }
  }, [])

  const dismissToast = (toastId) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === toastId ? { ...t, isDismissing: true } : t))
    )
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId))
    }, 300)
  }

  const handleViewOrder = (order) => {
    // If in admin or storefront, navigate or dispatch view order
    if (window.location.pathname.startsWith('/admin')) {
      window.dispatchEvent(new CustomEvent('onion_open_order_details', { detail: order }))
    } else {
      navigate('/admin')
    }
  }

  if (toasts.length === 0) return null

  return (
    <div className="onion-toast-container" aria-live="polite">
      {toasts.map((toast) => {
        const order = toast.order
        const branchLabel = order.branchName || (order.branchId ? `${order.branchId.toUpperCase()} Hub` : 'Punjab Hub')

        return (
          <div
            key={toast.id}
            className={`onion-order-toast ${toast.isDismissing ? 'dismissing' : ''}`}
            role="alert"
          >
            {/* Header */}
            <div className="onion-toast-header">
              <div className="onion-toast-tag-group">
                <div className={`onion-toast-badge ${toast.isTest ? 'test' : ''}`}>
                  <span className="onion-toast-pulse" />
                  <span>{toast.isTest ? '🧪 TEST ORDER' : '🔔 NEW ORDER'}</span>
                </div>
                <span className="onion-toast-order-id">#{order.id}</span>
              </div>

              <button
                type="button"
                className="onion-toast-close"
                onClick={() => dismissToast(toast.id)}
                aria-label="Close notification"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="onion-toast-body">
              <div className="onion-toast-customer-row">
                <span className="onion-toast-name">{order.customerName || 'Customer'}</span>
                <span className="onion-toast-amount">
                  ₹{Number(order.totalAmount || 0).toFixed(2)}
                </span>
              </div>

              <div className="onion-toast-items">
                <span>📦</span>
                <span>{order.packSize || 'Fresh Red Onions'}</span>
              </div>

              <div className="onion-toast-meta">
                <span className="onion-toast-hub">📍 {branchLabel}</span>
                <span>{order.paymentMethod ? (order.paymentMethod.includes('UPI') || order.paymentMethod.includes('Google') ? '💳 UPI / GPay' : '💵 Cash on Delivery') : 'COD'}</span>
              </div>

              <div className="onion-toast-actions">
                <button
                  type="button"
                  className="onion-toast-btn primary"
                  onClick={() => {
                    handleViewOrder(order)
                    dismissToast(toast.id)
                  }}
                >
                  <span>📋</span>
                  <span>View Order Details</span>
                </button>

                {order.customerPhone && (
                  <button
                    type="button"
                    className="onion-toast-btn secondary"
                    onClick={() => {
                      const cleanPhone = order.customerPhone.replace(/\D/g, '')
                      window.open(`https://wa.me/${cleanPhone}`, '_blank')
                    }}
                  >
                    <span>💬 WhatsApp</span>
                  </button>
                )}
              </div>
            </div>

            {/* Auto-dismiss progress timer */}
            <div className="onion-toast-progress-bar">
              <div className="onion-toast-progress-fill" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
