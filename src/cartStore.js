// ==========================================================================
// CENTRAL CART STORE WITH LOCALSTORAGE PERSISTENCE & EVENT BROADCASTING
// ==========================================================================

const CART_KEY = 'onion_store_cart_v1'

// Helper: load items from localStorage safely
export function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.error('Failed to parse cart storage:', err)
    return []
  }
}

// Helper: save items to localStorage & dispatch global sync event
function saveCart(cartItems) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems))
    window.dispatchEvent(new CustomEvent('onion_store_cart_updated', {
      detail: { cart: cartItems, count: getCartCount(cartItems), subtotal: getCartSubtotal(cartItems) }
    }))
  } catch (err) {
    console.error('Failed to save cart storage:', err)
  }
}

// Helper: calculate total count of items in cart
export function getCartCount(cart = null) {
  const items = cart || getCart()
  return items.reduce((total, item) => total + (Number(item.quantity) || 1), 0)
}

// Helper: calculate cart subtotal in ₹
export function getCartSubtotal(cart = null) {
  const items = cart || getCart()
  return items.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 1)), 0)
}

// Add product to cart with chosen weight & quantity
export function addToCart(product, quantity = 1, weight = null) {
  if (!product) return getCart()
  
  const currentCart = getCart()
  const chosenWeight = weight || product.weight || '1 kg'
  const chosenQty = Math.max(1, Number(quantity) || 1)
  const cartItemId = `${product.id || 'prod'}-${chosenWeight.replace(/\s+/g, '').toLowerCase()}`

  const existingIdx = currentCart.findIndex(item => item.id === cartItemId)

  let updatedCart = []
  if (existingIdx !== -1) {
    updatedCart = currentCart.map((item, idx) => {
      if (idx === existingIdx) {
        return {
          ...item,
          quantity: item.quantity + chosenQty,
          price: Number(product.price) || item.price
        }
      }
      return item
    })
  } else {
    const newItem = {
      id: cartItemId,
      productId: product.id,
      name: product.name,
      weight: chosenWeight,
      price: Number(product.price) || 35.00,
      oldPrice: Number(product.oldPrice) || (Number(product.price) * 1.25),
      discount: product.discount || '',
      image: product.image || null,
      bundles: product.bundles || 1,
      quantity: chosenQty,
      addedAt: Date.now()
    }
    updatedCart = [newItem, ...currentCart]
  }

  saveCart(updatedCart)
  return updatedCart
}

// Update quantity of an item in the cart
export function updateCartQuantity(cartItemId, newQty) {
  const currentCart = getCart()
  const targetQty = Number(newQty)

  if (targetQty <= 0) {
    return removeFromCart(cartItemId)
  }

  const updatedCart = currentCart.map(item => {
    if (item.id === cartItemId) {
      return { ...item, quantity: targetQty }
    }
    return item
  })

  saveCart(updatedCart)
  return updatedCart
}

// Remove single item from cart
export function removeFromCart(cartItemId) {
  const currentCart = getCart()
  const updatedCart = currentCart.filter(item => item.id !== cartItemId)
  saveCart(updatedCart)
  return updatedCart
}

// Clear all items in cart
export function clearCart() {
  saveCart([])
  return []
}
