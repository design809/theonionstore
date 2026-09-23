import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { getAdminStore } from './admin/adminStore'
import Header from './Header'
import Footer from './Footer'
import ScrollToTop from './ScrollToTop'
import OrderNotificationToast from './OrderNotificationToast'

// Storefront Pages
import Home from './Home'
import Products from './products'
import AboutUs from './about-us'
import OurFarmers from './our-farmers'
import FAQ from './faq'
import ContactUs from './contact-us'
import Blog from './blog'

// Admin & Branch Portal
import AdminPortal from './admin/AdminPortal'

import './App.css'

// Storefront Layout with persistent Header & Footer and Dynamic Theme Sync
function CustomerLayout() {
  const [store, setStore] = useState(getAdminStore())

  useEffect(() => {
    const applyTheme = () => {
      const s = getAdminStore()
      setStore(s)
      const settings = s.settings || {}
      const root = document.documentElement
      if (settings.primaryColor) root.style.setProperty('--os-plum-primary', settings.primaryColor)
      if (settings.secondaryColor) root.style.setProperty('--os-sprout-green', settings.secondaryColor)
      if (settings.topBarBgColor) root.style.setProperty('--os-topbar-bg', settings.topBarBgColor)
      if (settings.accentColor) root.style.setProperty('--os-accent-color', settings.accentColor)
    }

    applyTheme()
    window.addEventListener('admin_store_updated', applyTheme)
    return () => window.removeEventListener('admin_store_updated', applyTheme)
  }, [])

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <OrderNotificationToast />
      <Routes>
        {/* Admin Dashboard & Branch Member Portal */}
        <Route path="/admin" element={<AdminPortal />} />

        {/* Public Storefront Routes */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/our-farmers" element={<OurFarmers />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/blog" element={<Blog />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
