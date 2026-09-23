// ==========================================================================
// REAL-TIME ORDER NOTIFICATION SERVICE (SOUND + DESKTOP PUSH + EVENT BUS)
// ==========================================================================

const SOUND_KEY = 'onion_order_sound_enabled_v1'
const NOTIFICATIONS_STORAGE_KEY = 'onion_recent_notifications_v1'
const SEEN_ORDERS_KEY = 'onion_seen_order_ids_v1'

// --- Web Audio API Chime Synthesizer ---
let audioCtx = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

// Play pleasant multi-tone cash register / order chime
export function playOrderChime() {
  if (!isSoundEnabled()) return

  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    // Chime notes: C5 (523.25Hz) -> E5 (659.25Hz) -> G5 (783.99Hz) -> C6 (1046.50Hz)
    const notes = [
      { freq: 523.25, start: 0.0, duration: 0.25, gain: 0.25 },
      { freq: 659.25, start: 0.08, duration: 0.30, gain: 0.28 },
      { freq: 783.99, start: 0.16, duration: 0.35, gain: 0.32 },
      { freq: 1046.50, start: 0.24, duration: 0.65, gain: 0.38 }
    ]

    notes.forEach(({ freq, start, duration, gain }) => {
      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + start)

      // Smooth attack and exponential decay for crystal bell chime sound
      gainNode.gain.setValueAtTime(0.001, now + start)
      gainNode.gain.exponentialRampToValueAtTime(gain, now + start + 0.02)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + start + duration)

      osc.connect(gainNode)
      gainNode.connect(ctx.destination)

      osc.start(now + start)
      osc.stop(now + start + duration)
    })
  } catch (err) {
    console.warn('Audio chime playback notice:', err)
  }
}

// --- Sound Preferences ---
export function isSoundEnabled() {
  if (typeof window === 'undefined') return true
  const val = localStorage.getItem(SOUND_KEY)
  return val !== null ? val === 'true' : true
}

export function setSoundEnabled(enabled) {
  if (typeof window === 'undefined') return
  localStorage.setItem(SOUND_KEY, enabled ? 'true' : 'false')
  window.dispatchEvent(new CustomEvent('onion_sound_preference_changed', { detail: enabled }))
}

// --- Desktop / Browser Push Notifications API ---
export function getNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported'
  }
  return Notification.permission
}

export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported'
  }
  try {
    const permission = await Notification.requestPermission()
    return permission
  } catch (e) {
    console.error('Failed to request notification permission', e)
    return 'denied'
  }
}

export function sendBrowserNotification(order) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  try {
    const title = `🚨 New Order #${order.id || 'Received'}!`
    const branchName = order.branchName || order.branchId || 'Punjab Regional Hub'
    const body = `Customer: ${order.customerName || 'Customer'} (${order.customerPhone || 'N/A'})\nItems: ${order.packSize || 'Fresh Onions'} — Total: ₹${Number(order.totalAmount || 0).toFixed(2)}\nFulfillment: ${branchName}`

    const notification = new Notification(title, {
      body,
      icon: '/logo.png',
      tag: `order_${order.id || Date.now()}`,
      renotify: true,
      requireInteraction: true
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
      // Dispatch event to open order in admin
      window.dispatchEvent(new CustomEvent('onion_open_order_details', { detail: order }))
    }
  } catch (err) {
    console.warn('Could not display browser push notification:', err)
  }
}

// --- Order Deduplication & Tracking ---
let seenOrderIds = null

function getSeenOrderIds() {
  if (seenOrderIds) return seenOrderIds
  try {
    const saved = sessionStorage.getItem(SEEN_ORDERS_KEY)
    if (saved) {
      seenOrderIds = new Set(JSON.parse(saved))
      return seenOrderIds
    }
  } catch {
    // fallback
  }
  seenOrderIds = new Set()
  return seenOrderIds
}

function saveSeenOrderIds(set) {
  try {
    sessionStorage.setItem(SEEN_ORDERS_KEY, JSON.stringify(Array.from(set)))
  } catch {
    // ignore
  }
}

export function markOrderAsSeen(orderId) {
  const set = getSeenOrderIds()
  set.add(orderId)
  saveSeenOrderIds(set)
}

// Initialize seen order IDs with current orders without triggering alerts on first load
export function initOrderTracker(initialOrders = []) {
  const set = getSeenOrderIds()
  if (set.size === 0 && Array.isArray(initialOrders)) {
    initialOrders.forEach(o => {
      if (o && o.id) set.add(o.id)
    })
    saveSeenOrderIds(set)
  }
}

// Check incoming order list for new orders and notify
export function checkForNewOrders(orders = []) {
  if (!Array.isArray(orders) || orders.length === 0) return

  const set = getSeenOrderIds()
  
  // If first time encountering orders, seed the set
  if (set.size === 0) {
    initOrderTracker(orders)
    return
  }

  // Find orders that are not in the seen set
  const newOrders = orders.filter(o => o && o.id && !set.has(o.id))

  newOrders.forEach(newOrder => {
    set.add(newOrder.id)
    triggerOrderNotification(newOrder)
  })

  if (newOrders.length > 0) {
    saveSeenOrderIds(set)
  }
}

// Trigger single order notification (sound + toast + push)
export function triggerOrderNotification(order, isTest = false) {
  if (!order) return

  // 1. Play Sound
  playOrderChime()

  // 2. Dispatch custom in-app event for toast alert & topbar badge
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('onion_order_notification', {
      detail: {
        order,
        isTest,
        receivedAt: new Date().toISOString()
      }
    }))
  }

  // 3. Trigger Browser Native Push Notification
  sendBrowserNotification(order)

  // 4. Save to recent notification history
  saveRecentNotification(order, isTest)
}

// --- Notification History in LocalStorage ---
export function getRecentNotifications() {
  if (typeof window === 'undefined') return []
  try {
    const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    // ignore
  }
  return []
}

export function saveRecentNotification(order, isTest = false) {
  if (typeof window === 'undefined') return
  try {
    const history = getRecentNotifications()
    const item = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      orderId: order.id,
      customerName: order.customerName || 'Customer',
      customerPhone: order.customerPhone || '',
      packSize: order.packSize || 'Fresh Onions',
      totalAmount: order.totalAmount || 0,
      branchId: order.branchId || 'amritsar',
      paymentMethod: order.paymentMethod || 'Cash on Delivery',
      receivedAt: new Date().toISOString(),
      isRead: false,
      isTest
    }

    const updated = [item, ...history].slice(0, 30) // Keep last 30
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('onion_notification_history_updated', { detail: updated }))
  } catch (err) {
    console.error('Failed saving notification history', err)
  }
}

export function markAllNotificationsAsRead() {
  if (typeof window === 'undefined') return
  try {
    const history = getRecentNotifications()
    const updated = history.map(n => ({ ...n, isRead: true }))
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('onion_notification_history_updated', { detail: updated }))
  } catch {
    // ignore
  }
}

export function clearNotificationHistory() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY)
  window.dispatchEvent(new CustomEvent('onion_notification_history_updated', { detail: [] }))
}

// --- Test Order Trigger ---
export function triggerTestOrder() {
  const randomId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`
  const mockNames = ['Gurpreet Singh', 'Navjot Kaur', 'Manmohan Verma', 'Rajinder Kumar', 'Simran Dhillon']
  const mockBranches = ['amritsar', 'jalandhar', 'batala', 'gurdaspur']
  const mockPacks = ['5kg Sack', '10kg Wholesale Sack', '3kg Family Pack', '2kg Pack']
  const mockPrices = [175, 350, 105, 70]
  
  const randIdx = Math.floor(Math.random() * mockNames.length)

  const testOrder = {
    id: randomId,
    customerName: mockNames[randIdx],
    customerPhone: '+91 98765 43210',
    deliveryAddress: 'Main Market Road, Model Town, Punjab',
    branchId: mockBranches[randIdx % mockBranches.length],
    packSize: mockPacks[randIdx % mockPacks.length],
    quantity: 1,
    totalAmount: mockPrices[randIdx % mockPrices.length],
    paymentMethod: randIdx % 2 === 0 ? 'Google Pay / UPI' : 'Cash on Delivery (COD)',
    status: 'Pending',
    date: new Date().toISOString().replace('T', ' ').substring(0, 16)
  }

  triggerOrderNotification(testOrder, true)
  return testOrder
}
