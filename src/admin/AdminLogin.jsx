import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { loginUser, getAdminStore } from './adminStore'
import logoImg from '../assets/logo.png'

export default function AdminLogin({ onLoginSuccess }) {
  const store = getAdminStore()
  const settings = store?.settings || {}
  const logoSrc = settings.customLogoUrl || logoImg
  const siteTitle = settings.siteTitle || 'The Onion Store'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const [showPassword, setShowPassword] = useState(false)

  const handleLoginSubmit = (e) => {
    e.preventDefault()
    setErrorMsg('')
    const result = loginUser(username, password)
    if (result.success) {
      onLoginSuccess(result.user)
    } else {
      setErrorMsg(result.message)
    }
  }

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        
        {/* Header Logo */}
        <div className="login-header-logo">
          <img src={logoSrc} alt={siteTitle} className="login-logo-img" />
          <h2 className="login-title">{siteTitle}</h2>
          <p className="login-sub">Sign in with your Admin or Regional Branch Member credentials.</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="login-error-alert">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form className="admin-login-form" onSubmit={handleLoginSubmit}>
          <div className="admin-form-group">
            <label htmlFor="admin-user">Username</label>
            <input 
              type="text" 
              id="admin-user" 
              required
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div className="admin-form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="admin-pass">Password</label>
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', color: '#74114e', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer' }}
              >
                {showPassword ? 'Hide 👁️' : 'Show 👁️'}
              </button>
            </div>
            <input 
              type={showPassword ? 'text' : 'password'} 
              id="admin-pass" 
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="login-submit-btn">
            Sign In to Dashboard &rarr;
          </button>
        </form>

        {/* Back to Website */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link to="/" style={{ color: '#74114e', fontSize: '12.5px', fontWeight: 700, textDecoration: 'none' }}>
            &larr; Return to Customer Storefront
          </Link>
        </div>

      </div>
    </div>
  )
}
