// ==========================================================================
// CENTRAL ADMIN DATA STORE WITH LOCALSTORAGE PERSISTENCE
// ==========================================================================

import slide1 from '../assets/slider-bg-1.jpg'
import slide2 from '../assets/slider-bg-2.jpg'
import slide3 from '../assets/slider-bg-3.jpg'
import onionPng from '../assets/onion-1kg.png'
import { db } from '../firebase'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { checkForNewOrders, initOrderTracker, triggerOrderNotification, markOrderAsSeen } from '../notificationService'

const STORE_KEY = 'onion_store_admin_data_v1'
const AUTH_KEY = 'onion_store_auth_user_v1'
const STORE_DOC_PATH = 'store/current'

// Helper to sanitize data for Firestore (removes undefined, functions)
function sanitizeForFirestore(obj) {
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    if (value === undefined) return null
    return value
  }))
}

// Default Initial Seed Data
export const INITIAL_DATA = {
  // 1. User Accounts (Super Admin + 4 Branch Managers)
  users: [
    {
      id: 'usr_admin',
      username: 'admin',
      password: '123',
      role: 'admin',
      name: 'Super Admin (Head Office)',
      branchId: 'all',
      branchName: 'Headquarters (All Punjab Hubs)',
      email: 'admin@theonionstore.in',
      phone: '+91 98765 43210',
      status: 'active',
      createdAt: '2026-09-01'
    },
    {
      id: 'usr_amritsar',
      username: 'amritsar',
      password: '123',
      role: 'branch',
      name: 'Amritsar Hub Manager',
      branchId: 'amritsar',
      branchName: 'Amritsar Central Hub',
      email: 'amritsar@theonionstore.in',
      phone: '+91 98765 43210',
      status: 'active',
      createdAt: '2026-09-05'
    },
    {
      id: 'usr_jalandhar',
      username: 'jalandhar',
      password: '123',
      role: 'branch',
      name: 'Jalandhar Hub Manager',
      branchId: 'jalandhar',
      branchName: 'Jalandhar City Hub',
      email: 'jalandhar@theonionstore.in',
      phone: '+91 98765 43211',
      status: 'active',
      createdAt: '2026-09-05'
    },
    {
      id: 'usr_batala',
      username: 'batala',
      password: '123',
      role: 'branch',
      name: 'Batala Depot Manager',
      branchId: 'batala',
      branchName: 'Batala Agro Depot',
      email: 'batala@theonionstore.in',
      phone: '+91 98765 43212',
      status: 'active',
      createdAt: '2026-09-06'
    },
    {
      id: 'usr_gurdaspur',
      username: 'gurdaspur',
      password: '123',
      role: 'branch',
      name: 'Gurdaspur Mandi Manager',
      branchId: 'gurdaspur',
      branchName: 'Gurdaspur Mandi Hub',
      email: 'gurdaspur@theonionstore.in',
      phone: '+91 98765 43213',
      status: 'active',
      createdAt: '2026-09-06'
    }
  ],

  // 2. Products Catalog (1kg to 10kg Packs)
  products: [
    {
      id: 1,
      name: 'Fresh Red Onions - 1kg Pack',
      weight: '1 kg',
      weightKg: 1,
      bundles: 1,
      price: 35.00,
      oldPrice: 45.00,
      discount: '22% OFF',
      rating: 5,
      reviewCount: 28,
      status: 'in_stock',
      description: 'Hand-sorted single bundle fresh red onions harvested from fertile Nashik Valley & Punjab agro-fields.',
      stocks: {
        amritsar: 250,
        jalandhar: 180,
        batala: 120,
        gurdaspur: 160
      }
    },
    {
      id: 2,
      name: 'Fresh Red Onions - 2kg Pack',
      weight: '2 kg',
      weightKg: 2,
      bundles: 2,
      price: 70.00,
      oldPrice: 90.00,
      discount: '22% OFF',
      rating: 5,
      reviewCount: 42,
      status: 'in_stock',
      description: 'Two bundled pack of premium grade red onions. Naturally sun-cured for lasting freshness.',
      stocks: {
        amritsar: 200,
        jalandhar: 150,
        batala: 95,
        gurdaspur: 130
      }
    },
    {
      id: 3,
      name: 'Fresh Red Onions - 3kg Family Pack',
      weight: '3 kg',
      weightKg: 3,
      bundles: 3,
      price: 105.00,
      oldPrice: 135.00,
      discount: '22% OFF',
      rating: 5,
      reviewCount: 36,
      status: 'in_stock',
      description: 'Three bundled family value pack with rich pungency and firm crisp outer layers.',
      stocks: {
        amritsar: 160,
        jalandhar: 120,
        batala: 80,
        gurdaspur: 90
      }
    },
    {
      id: 4,
      name: 'Fresh Red Onions - 4kg Kitchen Pack',
      weight: '4 kg',
      weightKg: 4,
      bundles: 4,
      price: 140.00,
      oldPrice: 180.00,
      discount: '22% OFF',
      rating: 5,
      reviewCount: 19,
      status: 'in_stock',
      description: 'Four bundled kitchen reserve pack. High dry matter with zero chemical sprouting inhibitors.',
      stocks: {
        amritsar: 110,
        jalandhar: 90,
        batala: 60,
        gurdaspur: 75
      }
    },
    {
      id: 5,
      name: 'Fresh Red Onions - 5kg Sack',
      weight: '5 kg',
      weightKg: 5,
      bundles: 5,
      price: 175.00,
      oldPrice: 225.00,
      discount: '22% OFF',
      rating: 5,
      reviewCount: 64,
      status: 'in_stock',
      description: 'Bestselling 5-bundle breathable sack for households and medium kitchens.',
      stocks: {
        amritsar: 190,
        jalandhar: 140,
        batala: 110,
        gurdaspur: 130
      }
    },
    {
      id: 6,
      name: 'Fresh Red Onions - 6kg Value Pack',
      weight: '6 kg',
      weightKg: 6,
      bundles: 6,
      price: 210.00,
      oldPrice: 270.00,
      discount: '22% OFF',
      rating: 5,
      reviewCount: 15,
      status: 'in_stock',
      description: 'Six bundle value pack providing fresh stock for up to 4 weeks of daily Punjabi cooking.',
      stocks: {
        amritsar: 85,
        jalandhar: 65,
        batala: 45,
        gurdaspur: 50
      }
    },
    {
      id: 7,
      name: 'Fresh Red Onions - 7kg Saver Sack',
      weight: '7 kg',
      weightKg: 7,
      bundles: 7,
      price: 245.00,
      oldPrice: 315.00,
      discount: '22% OFF',
      rating: 5,
      reviewCount: 22,
      status: 'in_stock',
      description: 'Seven bundle saver bag for joint families and festive culinary celebrations.',
      stocks: {
        amritsar: 70,
        jalandhar: 50,
        batala: 40,
        gurdaspur: 45
      }
    },
    {
      id: 8,
      name: 'Fresh Red Onions - 8kg Bulk Sack',
      weight: '8 kg',
      weightKg: 8,
      bundles: 8,
      price: 280.00,
      oldPrice: 360.00,
      discount: '22% OFF',
      rating: 5,
      reviewCount: 31,
      status: 'in_stock',
      description: 'Eight bundle commercial & household sack directly sorted from regional mandis.',
      stocks: {
        amritsar: 65,
        jalandhar: 55,
        batala: 35,
        gurdaspur: 40
      }
    },
    {
      id: 9,
      name: 'Fresh Red Onions - 9kg Bulk Pack',
      weight: '9 kg',
      weightKg: 9,
      bundles: 9,
      price: 315.00,
      oldPrice: 405.00,
      discount: '22% OFF',
      rating: 5,
      reviewCount: 18,
      status: 'in_stock',
      description: 'Nine bundle pack delivering farm-fresh consistency for caterers and large homes.',
      stocks: {
        amritsar: 50,
        jalandhar: 40,
        batala: 30,
        gurdaspur: 35
      }
    },
    {
      id: 10,
      name: 'Fresh Red Onions - 10kg Wholesale Sack',
      weight: '10 kg',
      weightKg: 10,
      bundles: 10,
      price: 350.00,
      oldPrice: 450.00,
      discount: '22% OFF',
      rating: 5,
      reviewCount: 88,
      status: 'in_stock',
      description: 'Ten bundle heavy-duty wholesale bag for dhabas, restaurants, caterers, and bulk buyers.',
      stocks: {
        amritsar: 140,
        jalandhar: 110,
        batala: 85,
        gurdaspur: 95
      }
    }
  ],

  // 3. Main Hero Slider Banners
  banners: [
    {
      id: 1,
      watermark: 'ONIONS',
      title: 'Fresh Onions For Live Healthy',
      description: 'Naturally grown, pesticide-free farm onions hand-selected for intense aroma, rich sweetness, and supreme culinary quality.',
      btnText: 'SHOP ONIONS',
      btnLink: '/products',
      image: slide1
    },
    {
      id: 2,
      watermark: 'ORGANIC',
      title: '100% Farm Harvested Red & Yellow Onions',
      description: 'From sweet Spanish yellows to pungent red globes and delicate shallots, direct from our organic fields to your kitchen.',
      btnText: 'EXPLORE VARIETIES',
      btnLink: '/products',
      image: slide2
    },
    {
      id: 3,
      watermark: 'HARVEST',
      title: 'Direct From Farm To Your Store',
      description: 'Carefully sorted and cured to guarantee maximum crispness, longer shelf life, and unmatched farm-fresh flavor in every bite.',
      btnText: 'VIEW HARVEST',
      btnLink: '/our-farmers',
      image: slide3
    }
  ],

  // 4. Regional Branch Hub Contacts & Full Warehouse Stock (in KG)
  branches: [
    {
      id: 'amritsar',
      name: 'Amritsar Regional Hub',
      city: 'Amritsar',
      type: 'Central Distribution Hub',
      address: 'GT Road, Near Alpha One Mall, Amritsar, Punjab 143001',
      phone: '+91 98765 43210',
      email: 'amritsar@theonionstore.in',
      hours: '7:00 AM – 9:30 PM (Daily)',
      manager: 'Harpreet Singh',
      coverage: 'Amritsar City, Majitha, Jandiala Guru, Attari',
      active: true,
      totalStockKg: 18500,
      minThresholdKg: 3000,
      maxCapacityKg: 25000,
      lastRestocked: '2026-09-19 (Nashik Grade-A Truck #PB02-8899)'
    },
    {
      id: 'jalandhar',
      name: 'Jalandhar City Hub',
      city: 'Jalandhar',
      type: 'Regional Distribution Center',
      address: 'GTB Nagar, Near Model Town, Jalandhar, Punjab 144003',
      phone: '+91 98765 43211',
      email: 'jalandhar@theonionstore.in',
      hours: '7:00 AM – 9:30 PM (Daily)',
      manager: 'Manmohan Verma',
      coverage: 'Model Town, Urban Estate, Cantt, Rama Mandi',
      active: true,
      totalStockKg: 14200,
      minThresholdKg: 2500,
      maxCapacityKg: 20000,
      lastRestocked: '2026-09-18 (Punjab Agro Harvest Lot #JAL-204)'
    },
    {
      id: 'batala',
      name: 'Batala Agro Depot',
      city: 'Batala',
      type: 'Processing & Sorting Depot',
      address: 'Qadian Road, Near Cooperative Sugar Mill, Batala, Punjab 143505',
      phone: '+91 98765 43212',
      email: 'batala@theonionstore.in',
      hours: '7:00 AM – 9:00 PM (Daily)',
      manager: 'Gurmeet Singh',
      coverage: 'Batala Town, Qadian, Fatehgarh Churian, Dera Baba Nanak',
      active: true,
      totalStockKg: 9600,
      minThresholdKg: 1500,
      maxCapacityKg: 15000,
      lastRestocked: '2026-09-18 (Majha Belts Direct Supply)'
    },
    {
      id: 'gurdaspur',
      name: 'Gurdaspur Mandi Hub',
      city: 'Gurdaspur',
      type: 'Border Belt Sourcing Hub',
      address: 'Tibri Road, Main Dana Mandi, Gurdaspur, Punjab 143521',
      phone: '+91 98765 43213',
      email: 'gurdaspur@theonionstore.in',
      hours: '6:30 AM – 9:00 PM (Daily)',
      manager: 'Balwinder Dhillon',
      coverage: 'Gurdaspur City, Dinanagar, Kalanaur, Dhariwal',
      active: true,
      totalStockKg: 11400,
      minThresholdKg: 2000,
      maxCapacityKg: 18000,
      lastRestocked: '2026-09-19 (Tibri Road Dana Mandi Lot)'
    }
  ],

  // 5. Blog Journal Articles
  blogs: [
    {
      id: 1,
      title: 'The Secret Behind Nashik & Punjab Red Onions: Soil, Sun & Sweetness',
      excerpt: 'Discover why our Nashik Valley and Punjab fertile soil produces red onions with high dry matter, distinct pungency, and natural long-lasting freshness.',
      date: 'September 18, 2026',
      author: 'Harpreet Singh (Agronomist)',
      category: 'Farming & Origin',
      readTime: '4 min read',
      tags: ['Organic Farming', 'Nashik Onions', 'Punjab Harvest'],
      content: 'Nashik red onions are globally renowned for their rich purple-red skins and balanced sugar-to-sulfur ratio. By harvesting at the peak maturity index and curing them in open-ventilated sheds under the northern Punjab sun, we retain 100% of the bulb moisture without artificial wax coatings.'
    },
    {
      id: 2,
      title: 'How to Store 5kg and 10kg Bulk Onion Sacks for Up to 8 Weeks',
      excerpt: 'Practical storage techniques from master farmers on preventing sprouting, maintaining crisp crunch, and keeping your household onion supply fresh.',
      date: 'September 14, 2026',
      author: 'Sumanjeet Kaur (Quality Head)',
      category: 'Storage Guide',
      readTime: '3 min read',
      tags: ['Storage Tips', 'Kitchen Hacks', 'Bulk Sacks'],
      content: 'Never store raw red onions in plastic bags or inside the refrigerator! The moisture promotes rotting and mold. Instead, keep them in our breathable mesh sacks in a cool, dark, well-aerated pantry basket between 15°C–22°C away from direct sunlight and potatoes.'
    },
    {
      id: 3,
      title: 'Farm-to-Doorstep: Why Bypassing Middlemen Empowers Punjab Farmers',
      excerpt: 'How The Onion Store direct procurement model delivers guaranteed 25%+ higher payouts to farmers while keeping prices transparent at ₹35/kg for families.',
      date: 'September 08, 2026',
      author: 'Gurmeet Singh (Farmer Partner)',
      category: 'Fair Trade',
      readTime: '5 min read',
      tags: ['Fair Trade', 'Direct Sourcing', 'Mandi Reform'],
      content: 'Traditional vegetable supply chains involve 4–5 commission agents, leading to high spoilage and squeezed grower margins. By establishing direct sorting and chilling depots in Batala, Gurdaspur, Jalandhar, and Amritsar, we bridge the gap between rural farms and urban dining tables.'
    },
    {
      id: 4,
      title: 'Health & Immunity: Why Fresh Red Onions Belong in Your Daily Diet',
      excerpt: 'Loaded with quercetin antioxidants, sulfur compounds, and dietary fiber, learn how fresh onions boost heart health and natural gut immunity.',
      date: 'August 29, 2026',
      author: 'Dr. Navdeep Sharma (Nutritionist)',
      category: 'Health & Wellness',
      readTime: '4 min read',
      tags: ['Health Benefits', 'Quercetin', 'Immunity'],
      content: 'Red onions are one of nature’s richest dietary sources of quercetin—a potent bioflavonoid known for reducing inflammation and regulating blood sugar levels. Eating raw sliced onions with your daily meals supports gut microbiome diversity and heart vitality.'
    }
  ],

  // 6. FAQs
  faqs: [
    {
      id: 1,
      category: 'sourcing',
      question: 'Where are The Onion Store red onions sourced from?',
      answer: 'Our onions are directly harvested from certified agro-farms in the fertile Nashik Valley (Maharashtra) and our partner farming belts across Gurdaspur, Batala, and Amritsar (Punjab). We bypass middlemen to ensure peak freshness within 24–48 hours of harvest.'
    },
    {
      id: 2,
      category: 'orders',
      question: 'What pack sizes are available and what is the pricing?',
      answer: 'We offer standardized household and commercial packs from 1kg to 10kg at a transparent rate of ₹35/kg. Value discounts and bundle savings are automatically applied on larger packs (e.g., 2kg, 6kg, 8kg, 10kg).'
    },
    {
      id: 3,
      category: 'delivery',
      question: 'How fast is delivery in Amritsar, Jalandhar, Batala, and Gurdaspur?',
      answer: 'We offer Same-Day Express Delivery for orders placed before 1:00 PM in Amritsar, Jalandhar, Batala, and Gurdaspur municipal limits. Orders placed later are delivered the next morning before 10:00 AM.'
    },
    {
      id: 4,
      category: 'quality',
      question: 'How long can I store these red onions at room temperature?',
      answer: 'Because our onions undergo traditional natural sun-curing with dry protective outer layers, they stay fresh, firm, and sprout-free for 6 to 8 weeks when stored in a cool, ventilated, dry basket.'
    },
    {
      id: 5,
      category: 'wholesale',
      question: 'Do you offer bulk wholesale supplies for restaurants and caterers?',
      answer: 'Yes! We supply commercial 10kg, 25kg, and 50kg wholesale sacks to hotels, banquet halls, dhabas, and caterers across Punjab with custom scheduled deliveries and GST invoicing. Contact your local regional depot for corporate rates.'
    },
    {
      id: 6,
      category: 'payment',
      question: 'What payment methods do you accept?',
      answer: 'We support Cash on Delivery (COD), UPI (Google Pay, PhonePe, Paytm), Net Banking, and major Debit/Credit Cards. You can also pay upon physical delivery inspection at your doorstep.'
    },
    {
      id: 7,
      category: 'orders',
      question: 'What is your refund or replacement policy?',
      answer: 'We offer a 100% No-Questions-Asked Replacement Guarantee. If you receive any soft or damaged bulbs, notify us within 24 hours via phone or WhatsApp for an instant replacement or full refund.'
    }
  ],

  // 7. Orders (Customer Orders Routed to Branches)
  orders: [
    {
      id: 'ORD-1094',
      customerName: 'S. Rajinder Singh',
      customerPhone: '+91 98140 11223',
      deliveryAddress: 'House 42, Ranjit Avenue, Block B, Amritsar',
      branchId: 'amritsar',
      packSize: '5kg Sack',
      quantity: 2,
      totalAmount: 350.00,
      paymentMethod: 'Cash on Delivery (COD)',
      status: 'Confirmed', // Pending, Confirmed, Out for Delivery, Delivered, Cancelled
      date: '2026-09-19 14:20',
      notes: 'Please deliver after 5:00 PM'
    },
    {
      id: 'ORD-1093',
      customerName: 'Karan Dhillon (Dhaba Owner)',
      customerPhone: '+91 98722 33445',
      deliveryAddress: 'Grand Trunk Road, Near BMC Chowk, Jalandhar',
      branchId: 'jalandhar',
      packSize: '10kg Wholesale Sack',
      quantity: 5,
      totalAmount: 1750.00,
      paymentMethod: 'UPI Paid',
      status: 'Out for Delivery',
      date: '2026-09-19 13:05',
      notes: 'Commercial kitchen delivery invoice required'
    },
    {
      id: 'ORD-1092',
      customerName: 'Simranjeet Kaur',
      customerPhone: '+91 99880 55667',
      deliveryAddress: 'Street 3, Near Sugar Mill, Batala',
      branchId: 'batala',
      packSize: '3kg Family Pack',
      quantity: 1,
      totalAmount: 105.00,
      paymentMethod: 'Cash on Delivery (COD)',
      status: 'Delivered',
      date: '2026-09-19 11:30',
      notes: 'Ring doorbell twice'
    },
    {
      id: 'ORD-1091',
      customerName: 'Advocate Baldev Sharma',
      customerPhone: '+91 97800 77889',
      deliveryAddress: 'Court Road, Civil Lines, Gurdaspur',
      branchId: 'gurdaspur',
      packSize: '10kg Wholesale Sack',
      quantity: 1,
      totalAmount: 350.00,
      paymentMethod: 'Cash on Delivery (COD)',
      status: 'Confirmed',
      date: '2026-09-19 09:45',
      notes: 'Call before dispatch'
    },
    {
      id: 'ORD-1090',
      customerName: 'Amanpreet Singh',
      customerPhone: '+91 94170 99001',
      deliveryAddress: 'Lawrence Road, Near Novelty Chowk, Amritsar',
      branchId: 'amritsar',
      packSize: '2kg Pack',
      quantity: 1,
      totalAmount: 70.00,
      paymentMethod: 'UPI Paid',
      status: 'Delivered',
      date: '2026-09-18 17:15',
      notes: 'Leave at security gate'
    }
  ],

  // 8. Site Theme, Branding, Text, Button & Social Media Settings
  settings: {
    // Branding
    siteTitle: 'The Onion Store',
    tagline: 'Farm to Store — Direct from Punjab & Nashik Agro Fields',
    logoText: 'The Onion Store',
    customLogoUrl: '',
    
    // Theme Colors
    primaryColor: '#74114e',
    secondaryColor: '#6db327',
    topBarBgColor: '#0a6637',
    accentColor: '#eb001b',
    bodyBgColor: '#ffffff',
    
    // Text & Announcements
    announcementText: '⚡ Same-Day Express Delivery Across Amritsar, Jalandhar, Batala & Gurdaspur! Guaranteed ₹35/kg Fair Rates.',
    showAnnouncement: true,
    heroCtaText: 'SHOP 1KG - 10KG PACKS',
    contactHotline: '+91 98765 43210',
    supportEmail: 'support@theonionstore.in',
    workingHours: 'Mon - Sun: 7:00 AM - 9:30 PM',
    
    // Social Media Links
    socialLinks: {
      facebook: 'https://facebook.com/theonionstore',
      instagram: 'https://instagram.com/theonionstore',
      twitter: 'https://twitter.com/theonionstore',
      pinterest: 'https://pinterest.com/theonionstore',
      youtube: 'https://youtube.com/@theonionstore',
      whatsapp: 'https://wa.me/919876543210'
    }
  }
}

// --------------------------------------------------------------------------
// STORE HELPER FUNCTIONS & FIRESTORE REAL-TIME SYNC
// --------------------------------------------------------------------------

export function resolveBannerImage(img, fallbackIndex = 0) {
  const presets = [slide1, slide2, slide3]
  if (!img || typeof img !== 'string') {
    return presets[fallbackIndex % presets.length] || slide1
  }
  // If it's a custom user uploaded image (Base64 data URL) or external HTTPS URL, keep it directly
  if (img.startsWith('data:image/') || img.startsWith('http://') || img.startsWith('https://')) {
    return img
  }
  // If it's a preset identifier or relative asset reference
  if (img === 'preset1' || img.includes('slider-bg-1')) return slide1
  if (img === 'preset2' || img.includes('slider-bg-2')) return slide2
  if (img === 'preset3' || img.includes('slider-bg-3')) return slide3
  if (img.startsWith('/src/assets/') || img.startsWith('/assets/')) {
    if (img.includes('1')) return slide1
    if (img.includes('2')) return slide2
    if (img.includes('3')) return slide3
    return presets[fallbackIndex % presets.length] || slide1
  }
  return img || presets[fallbackIndex % presets.length] || slide1
}

export function resolveProductImage(img) {
  if (!img || typeof img !== 'string') return onionPng
  if (img.startsWith('data:image/') || img.startsWith('http://') || img.startsWith('https://')) {
    return img
  }
  if (img.includes('onion') || img.startsWith('/src/assets/') || img.startsWith('/assets/')) {
    return onionPng
  }
  return img || onionPng
}

function mergeCloudData(cloudData) {
  if (!cloudData) return INITIAL_DATA

  const banners = (cloudData.banners && Array.isArray(cloudData.banners) && cloudData.banners.length > 0)
    ? cloudData.banners.map((b, idx) => ({
        ...b,
        image: resolveBannerImage(b.image, idx)
      }))
    : INITIAL_DATA.banners

  const products = (cloudData.products && Array.isArray(cloudData.products) && cloudData.products.length > 0)
    ? cloudData.products.map(p => ({
        ...p,
        image: resolveProductImage(p.image)
      }))
    : INITIAL_DATA.products

  return {
    ...INITIAL_DATA,
    ...cloudData,
    banners,
    products,
    users: cloudData.users || INITIAL_DATA.users,
    branches: (cloudData.branches || INITIAL_DATA.branches).map(b => {
      const def = INITIAL_DATA.branches.find(ib => ib.id === b.id)
      return {
        ...(def || {}),
        ...b,
        totalStockKg: b.totalStockKg !== undefined ? b.totalStockKg : (def ? def.totalStockKg : 10000),
        minThresholdKg: b.minThresholdKg !== undefined ? b.minThresholdKg : (def ? def.minThresholdKg : 2000),
        maxCapacityKg: b.maxCapacityKg !== undefined ? b.maxCapacityKg : (def ? def.maxCapacityKg : 20000),
        lastRestocked: b.lastRestocked || (def ? def.lastRestocked : '2026-09-19')
      }
    }),
    settings: {
      ...INITIAL_DATA.settings,
      ...(cloudData.settings || {}),
      socialLinks: {
        ...INITIAL_DATA.settings.socialLinks,
        ...((cloudData.settings && cloudData.settings.socialLinks) || {})
      }
    },
    orders: cloudData.orders || INITIAL_DATA.orders,
    blogs: cloudData.blogs || INITIAL_DATA.blogs,
    faqs: cloudData.faqs || INITIAL_DATA.faqs,
    paymentScanner: {
      ...INITIAL_DATA.paymentScanner,
      ...(cloudData.paymentScanner || {})
    }
  }
}

let isFirestoreListenerActive = false

export function initFirestoreSync() {
  if (isFirestoreListenerActive || typeof window === 'undefined') return
  isFirestoreListenerActive = true

  try {
    const storeDocRef = doc(db, 'store', 'current')
    onSnapshot(
      storeDocRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          const cloudData = snapshot.data()
          const localSaved = localStorage.getItem(STORE_KEY)
          let shouldUpdate = true

          // Check if remote cloud snapshot contains newly arrived orders
          if (cloudData.orders && Array.isArray(cloudData.orders)) {
            checkForNewOrders(cloudData.orders)
          }

          if (localSaved) {
            try {
              const localParsed = JSON.parse(localSaved)
              // If local edit is newer than cloud snapshot, don't revert local state
              if (localParsed._updatedAt && cloudData._updatedAt && localParsed._updatedAt > cloudData._updatedAt) {
                shouldUpdate = false
              }
            } catch {
              shouldUpdate = true
            }
          }

          if (shouldUpdate) {
            const merged = mergeCloudData(cloudData)
            localStorage.setItem(STORE_KEY, JSON.stringify(merged))
            window.dispatchEvent(new Event('admin_store_updated'))
          }
        } else {
          // If Firestore is empty, seed it with current store
          try {
            const current = getAdminStore()
            await setDoc(storeDocRef, sanitizeForFirestore({ ...current, _updatedAt: Date.now() }))
          } catch (seedErr) {
            console.warn('Notice seeding initial data to Firestore:', seedErr)
            window.dispatchEvent(new CustomEvent('admin_sync_error', { detail: seedErr?.message }))
          }
        }
      },
      (error) => {
        console.error('Firestore real-time sync error:', error)
        window.dispatchEvent(new CustomEvent('admin_sync_error', { detail: error?.message }))
      }
    )
  } catch (err) {
    console.error('Failed to start Firestore sync:', err)
  }
}

export function getAdminStore() {
  try {
    const saved = localStorage.getItem(STORE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      const merged = mergeCloudData(parsed)
      initOrderTracker(merged.orders)
      return merged
    }
  } catch (e) {
    console.error('Error loading admin store from localStorage', e)
  }
  // Initialize with initial data
  localStorage.setItem(STORE_KEY, JSON.stringify(INITIAL_DATA))
  initOrderTracker(INITIAL_DATA.orders)
  return INITIAL_DATA
}

export function saveAdminStore(data) {
  try {
    const dataWithTimestamp = {
      ...data,
      _updatedAt: Date.now()
    }
    const sanitized = sanitizeForFirestore(dataWithTimestamp)
    localStorage.setItem(STORE_KEY, JSON.stringify(sanitized))
    window.dispatchEvent(new Event('admin_store_updated'))

    // Asynchronously push updates to Cloud Firestore
    const storeDocRef = doc(db, 'store', 'current')
    setDoc(storeDocRef, sanitized).catch(err => {
      console.error('Error syncing store update to Firestore:', err)
      window.dispatchEvent(new CustomEvent('admin_sync_error', { detail: err?.message }))
    })
  } catch (e) {
    console.error('Error saving admin store', e)
  }
}

export function resetAdminStore() {
  localStorage.setItem(STORE_KEY, JSON.stringify(INITIAL_DATA))
  window.dispatchEvent(new Event('admin_store_updated'))
  try {
    const storeDocRef = doc(db, 'store', 'current')
    setDoc(storeDocRef, sanitizeForFirestore(INITIAL_DATA)).catch(err => {
      console.error('Error resetting Firestore store:', err)
    })
  } catch (e) {
    console.error('Error in resetAdminStore', e)
  }
  return INITIAL_DATA
}

// --------------------------------------------------------------------------
// AUTH HELPER FUNCTIONS
// --------------------------------------------------------------------------

export function getAuthUser() {
  try {
    const saved = localStorage.getItem(AUTH_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('Error loading auth user', e)
  }
  return null
}

export function loginUser(username, password) {
  const store = getAdminStore()
  const cleanUser = username.trim().toLowerCase()
  const cleanPass = password.trim()

  const matchedUser = store.users.find(
    u => u.username.toLowerCase() === cleanUser && u.password === cleanPass && u.status === 'active'
  )

  if (matchedUser) {
    const sessionUser = {
      id: matchedUser.id,
      username: matchedUser.username,
      name: matchedUser.name,
      role: matchedUser.role,
      branchId: matchedUser.branchId,
      branchName: matchedUser.branchName,
      email: matchedUser.email,
      phone: matchedUser.phone
    }
    localStorage.setItem(AUTH_KEY, JSON.stringify(sessionUser))
    window.dispatchEvent(new Event('admin_auth_changed'))
    return { success: true, user: sessionUser }
  }

  return { success: false, message: 'Invalid username or password (or account inactive).' }
}

export function logoutUser() {
  localStorage.removeItem(AUTH_KEY)
  window.dispatchEvent(new Event('admin_auth_changed'))
}

// Helper to add a new customer inquiry/order from storefront
export function createCustomerOrder(orderData) {
  const store = getAdminStore()
  const newOrder = {
    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    status: 'Pending',
    ...orderData
  }
  markOrderAsSeen(newOrder.id)
  store.orders.unshift(newOrder)
  saveAdminStore(store)
  triggerOrderNotification(newOrder)
  return newOrder
}
