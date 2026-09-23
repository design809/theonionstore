import React, { useState } from 'react'

export default function BranchStockView({ store, user, onSave }) {
  const isSuperAdmin = user.role === 'admin'
  const [selectedBranchId, setSelectedBranchId] = useState(
    isSuperAdmin ? 'all' : user.branchId
  )
  const [editingBranch, setEditingBranch] = useState(null)
  const [newStockKg, setNewStockKg] = useState(0)
  const [inboundKg, setInboundKg] = useState('')
  const [minThresholdKg, setMinThresholdKg] = useState(2000)
  const [maxCapacityKg, setMaxCapacityKg] = useState(25000)
  const [restockNote, setRestockNote] = useState('')
  const [modalMode, setModalMode] = useState('set') // 'set' or 'add_inbound'

  const branches = store.branches || []

  // Calculate reserved kg from pending/confirmed customer orders for a branch
  const calculateReservedKg = (branchId) => {
    return (store.orders || [])
      .filter(o => o.branchId === branchId && (o.status === 'Pending' || o.status === 'Confirmed' || o.status === 'Out for Delivery'))
      .reduce((acc, curr) => {
        let weightPerUnit = 5
        const packStr = (curr.packSize || '').toLowerCase()
        if (packStr.includes('1kg')) weightPerUnit = 1
        else if (packStr.includes('2kg')) weightPerUnit = 2
        else if (packStr.includes('3kg')) weightPerUnit = 3
        else if (packStr.includes('4kg')) weightPerUnit = 4
        else if (packStr.includes('5kg')) weightPerUnit = 5
        else if (packStr.includes('6kg')) weightPerUnit = 6
        else if (packStr.includes('7kg')) weightPerUnit = 7
        else if (packStr.includes('8kg')) weightPerUnit = 8
        else if (packStr.includes('9kg')) weightPerUnit = 9
        else if (packStr.includes('10kg')) weightPerUnit = 10
        else if (packStr.includes('25kg')) weightPerUnit = 25
        return acc + (weightPerUnit * (curr.quantity || 1))
      }, 0)
  }

  // Filtered branches to display
  const displayedBranches = (selectedBranchId === 'all' || !selectedBranchId)
    ? branches
    : branches.filter(b => b.id === selectedBranchId)

  // Overall totals across displayed branches
  const totalAvailableKg = displayedBranches.reduce((acc, b) => acc + (b.totalStockKg || 0), 0)
  const totalReservedKg = displayedBranches.reduce((acc, b) => acc + calculateReservedKg(b.id), 0)
  const totalNetFreeKg = Math.max(0, totalAvailableKg - totalReservedKg)
  const totalCapacityKg = displayedBranches.reduce((acc, b) => acc + (b.maxCapacityKg || 25000), 0)
  const overallFillPercent = totalCapacityKg > 0 ? Math.min(100, Math.round((totalAvailableKg / totalCapacityKg) * 100)) : 0

  // Open modal to edit specific branch
  const openEditModal = (branch, mode = 'set') => {
    setEditingBranch(branch)
    setModalMode(mode)
    setNewStockKg(branch.totalStockKg || 0)
    setInboundKg('')
    setMinThresholdKg(branch.minThresholdKg || 2000)
    setMaxCapacityKg(branch.maxCapacityKg || 25000)
    setRestockNote(branch.lastRestocked || '')
  }

  // Quick adjust (+/- bulk kg)
  const handleQuickAdjustKg = (branchId, deltaKg) => {
    const updatedBranches = branches.map(b => {
      if (b.id === branchId) {
        const nextVal = Math.max(0, (b.totalStockKg || 0) + deltaKg)
        return {
          ...b,
          totalStockKg: nextVal
        }
      }
      return b
    })

    onSave({ ...store, branches: updatedBranches })
  }

  // Save modal updates
  const handleSaveModal = (e) => {
    e.preventDefault()
    if (!editingBranch) return

    let finalStockKg = parseInt(newStockKg, 10) || 0

    if (modalMode === 'add_inbound') {
      const added = parseInt(inboundKg, 10) || 0
      finalStockKg = Math.max(0, (editingBranch.totalStockKg || 0) + added)
    }

    const updatedBranches = branches.map(b => {
      if (b.id === editingBranch.id) {
        return {
          ...b,
          totalStockKg: finalStockKg,
          minThresholdKg: parseInt(minThresholdKg, 10) || 2000,
          maxCapacityKg: parseInt(maxCapacityKg, 10) || 25000,
          lastRestocked: restockNote.trim() || `Updated on ${new Date().toISOString().substring(0, 10)}`
        }
      }
      return b
    })

    onSave({ ...store, branches: updatedBranches })
    setEditingBranch(null)
  }

  return (
    <div className="admin-branch-stock-view">
      
      {/* 1. Header & Branch Switcher */}
      <div className="admin-card" style={{ marginBottom: '20px' }}>
        <div className="admin-card-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 className="admin-card-title" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🧅 Warehouse Stock & Bulk Inventory (in KG)
            </h2>
            <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>
              {isSuperAdmin 
                ? 'Full real-time available kilogram (kg) inventory across all 4 Punjab regional warehouse hubs.'
                : `Full available onion stock in kilograms (kg) for ${user.branchName || 'your branch'}.`}
            </p>
          </div>

          {/* Filter selector for super admin */}
          {isSuperAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#555' }}>Filter Hub:</span>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: '1px solid #ebd0e2',
                  background: '#ffffff',
                  fontWeight: 600,
                  color: '#74114e',
                  fontSize: '13px'
                }}
              >
                <option value="all">All Punjab Hubs (4)</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.city})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Top KPI Metrics Row */}
        <div className="admin-stats-grid" style={{ marginTop: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {/* Total Available KG */}
          <div className="admin-stat-card">
            <div className="stat-icon-wrap green">⚖️</div>
            <div className="stat-info">
              <span className="stat-label">Total Available Stock</span>
              <span className="stat-number" style={{ color: '#0a6637' }}>
                {totalAvailableKg.toLocaleString('en-IN')} <span style={{ fontSize: '14px', fontWeight: 600 }}>kg</span>
              </span>
              <span style={{ fontSize: '11.5px', color: '#777' }}>
                ≈ {(totalAvailableKg / 100).toFixed(1)} Quintals ({(totalAvailableKg / 1000).toFixed(2)} MT)
              </span>
            </div>
          </div>

          {/* Reserved for Active Orders */}
          <div className="admin-stat-card">
            <div className="stat-icon-wrap amber">🚚</div>
            <div className="stat-info">
              <span className="stat-label">Reserved for Dispatches</span>
              <span className="stat-number" style={{ color: '#b45309' }}>
                {totalReservedKg.toLocaleString('en-IN')} <span style={{ fontSize: '14px', fontWeight: 600 }}>kg</span>
              </span>
              <span style={{ fontSize: '11.5px', color: '#777' }}>
                From pending customer orders
              </span>
            </div>
          </div>

          {/* Net Free Stock */}
          <div className="admin-stat-card">
            <div className="stat-icon-wrap purple">✨</div>
            <div className="stat-info">
              <span className="stat-label">Net Free for Sale</span>
              <span className="stat-number" style={{ color: '#74114e' }}>
                {totalNetFreeKg.toLocaleString('en-IN')} <span style={{ fontSize: '14px', fontWeight: 600 }}>kg</span>
              </span>
              <span style={{ fontSize: '11.5px', color: '#777' }}>
                Ready for immediate dispatch
              </span>
            </div>
          </div>

          {/* Storage Capacity Fill */}
          <div className="admin-stat-card">
            <div className="stat-icon-wrap blue">🏢</div>
            <div className="stat-info">
              <span className="stat-label">Warehouse Capacity Fill</span>
              <span className="stat-number" style={{ color: '#1e40af' }}>
                {overallFillPercent}%
              </span>
              <span style={{ fontSize: '11.5px', color: '#777' }}>
                {totalAvailableKg.toLocaleString('en-IN')} / {totalCapacityKg.toLocaleString('en-IN')} kg
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Branch-by-Branch Master Inventory Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            📍 Regional Branch Kilogram (KG) Stock Levels
          </h3>
          <span style={{ fontSize: '12.5px', color: '#666' }}>
            Showing <strong>{displayedBranches.length}</strong> branch warehouse{displayedBranches.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Branch Hub & Location</th>
                <th>Total Available Stock</th>
                <th>Reserved Dispatches</th>
                <th>Net Free Stock</th>
                <th>Capacity Utilization</th>
                <th>Health Status</th>
                <th>Quick Adjust (KG)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedBranches.map((branch) => {
                const stockKg = branch.totalStockKg || 0
                const reservedKg = calculateReservedKg(branch.id)
                const netFreeKg = Math.max(0, stockKg - reservedKg)
                const minThreshold = branch.minThresholdKg || 2000
                const maxCap = branch.maxCapacityKg || 25000
                const fillPercent = Math.min(100, Math.round((stockKg / maxCap) * 100))

                // Determine Health Status
                let statusClass = 'in_stock'
                let statusText = 'Healthy Stock'
                if (stockKg === 0) {
                  statusClass = 'out_of_stock'
                  statusText = 'Depleted (0 kg)'
                } else if (stockKg <= minThreshold) {
                  statusClass = 'low_stock'
                  statusText = `Low (< ${minThreshold.toLocaleString('en-IN')} kg)`
                }

                const isUserBranch = user.branchId === branch.id || isSuperAdmin

                return (
                  <tr key={branch.id} style={{ background: user.branchId === branch.id ? '#faf5f8' : 'transparent' }}>
                    
                    {/* Branch Info */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>📍</span>
                        <div>
                          <strong style={{ fontSize: '14.5px', color: '#222' }}>{branch.name}</strong>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {branch.address.split(',')[0]} &bull; <span style={{ color: '#74114e', fontWeight: 600 }}>{branch.city}</span>
                          </div>
                          {branch.lastRestocked && (
                            <div style={{ fontSize: '11px', color: '#0a6637', marginTop: '2px' }}>
                              📦 Last Inbound: {branch.lastRestocked}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Total Stock KG */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '17px', fontWeight: 800, color: stockKg > minThreshold ? '#0a6637' : (stockKg > 0 ? '#b45309' : '#dc2626') }}>
                          {stockKg.toLocaleString('en-IN')} <span style={{ fontSize: '13px', fontWeight: 600 }}>kg</span>
                        </span>
                        <span style={{ fontSize: '11.5px', color: '#777' }}>
                          {(stockKg / 100).toFixed(1)} Quintals
                        </span>
                      </div>
                    </td>

                    {/* Reserved Dispatches */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '14.5px', fontWeight: 700, color: reservedKg > 0 ? '#b45309' : '#666' }}>
                          {reservedKg.toLocaleString('en-IN')} kg
                        </span>
                        <span style={{ fontSize: '11px', color: '#888' }}>
                          {reservedKg > 0 ? 'Orders in queue' : 'No pending orders'}
                        </span>
                      </div>
                    </td>

                    {/* Net Free Stock */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ fontSize: '15px', color: '#74114e' }}>
                          {netFreeKg.toLocaleString('en-IN')} kg
                        </strong>
                        <span style={{ fontSize: '11px', color: '#777' }}>
                          Ready to ship
                        </span>
                      </div>
                    </td>

                    {/* Capacity Progress Bar */}
                    <td style={{ minWidth: '130px' }}>
                      <div style={{ width: '100%', background: '#e5e7eb', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '4px' }}>
                        <div 
                          style={{ 
                            width: `${fillPercent}%`, 
                            height: '100%', 
                            background: fillPercent > 85 ? '#dc2626' : (fillPercent > 40 ? '#25a85c' : '#f59e0b'),
                            borderRadius: '4px',
                            transition: 'width 0.3s ease'
                          }} 
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#666' }}>
                        <span>{fillPercent}% full</span>
                        <span>{maxCap.toLocaleString('en-IN')} kg max</span>
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td>
                      <span className={`status-pill ${statusClass}`}>
                        {statusText}
                      </span>
                    </td>

                    {/* Quick Adjust Buttons */}
                    <td>
                      {isUserBranch ? (
                        <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                          <button 
                            className="table-icon-btn" 
                            onClick={() => handleQuickAdjustKg(branch.id, -1000)}
                            title="Reduce 1,000 kg"
                            disabled={stockKg < 1000}
                          >
                            -1k
                          </button>
                          <button 
                            className="table-icon-btn" 
                            onClick={() => handleQuickAdjustKg(branch.id, -100)}
                            title="Reduce 100 kg"
                            disabled={stockKg < 100}
                          >
                            -100
                          </button>
                          <button 
                            className="table-icon-btn" 
                            onClick={() => handleQuickAdjustKg(branch.id, +100)}
                            title="Add 100 kg"
                          >
                            +100
                          </button>
                          <button 
                            className="table-icon-btn" 
                            onClick={() => handleQuickAdjustKg(branch.id, +1000)}
                            title="Add 1,000 kg (1 Tonne)"
                          >
                            +1k
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11.5px', color: '#999', fontStyle: 'italic' }}>View only</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td>
                      {isUserBranch ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            className="table-icon-btn edit" 
                            onClick={() => openEditModal(branch, 'add_inbound')}
                            title="Log new inbound harvest truck"
                            style={{ background: '#e8f5e9', color: '#0a6637', borderColor: '#c8e6c9' }}
                          >
                            + Inbound
                          </button>
                          <button 
                            className="table-icon-btn edit" 
                            onClick={() => openEditModal(branch, 'set')}
                            title="Set exact stock kg"
                          >
                            Set KG
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11.5px', color: '#999' }}>—</span>
                      )}
                    </td>

                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Retail Pack Conversion Yield Helper Card */}
      <div className="admin-card" style={{ marginTop: '20px', background: 'linear-gradient(135deg, #fdf8fb 0%, #f4fbf5 100%)', borderColor: '#d1fae5' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#0a6637', display: 'flex', alignItems: 'center', gap: '8px' }}>
          💡 Retail Pack Yield Reference Guide ({totalAvailableKg.toLocaleString('en-IN')} kg available)
        </h4>
        <p style={{ fontSize: '13px', color: '#555', margin: '0 0 14px 0', lineHeight: 1.5 }}>
          Your raw bulk onion inventory can be packed and distributed into standardized customer household & commercial sacks:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <span style={{ fontSize: '11.5px', color: '#666', fontWeight: 600 }}>1kg Packs Yield</span>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#74114e', marginTop: '2px' }}>
              {totalAvailableKg.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '11px', color: '#888' }}>Household packs</span>
          </div>

          <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <span style={{ fontSize: '11.5px', color: '#666', fontWeight: 600 }}>2kg Packs Yield</span>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#74114e', marginTop: '2px' }}>
              {Math.floor(totalAvailableKg / 2).toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '11px', color: '#888' }}>Value packs</span>
          </div>

          <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <span style={{ fontSize: '11.5px', color: '#666', fontWeight: 600 }}>5kg Sacks Yield</span>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#0a6637', marginTop: '2px' }}>
              {Math.floor(totalAvailableKg / 5).toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '11px', color: '#888' }}>Kitchen sacks</span>
          </div>

          <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <span style={{ fontSize: '11.5px', color: '#666', fontWeight: 600 }}>10kg Wholesale Yield</span>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#0a6637', marginTop: '2px' }}>
              {Math.floor(totalAvailableKg / 10).toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '11px', color: '#888' }}>Wholesale sacks</span>
          </div>
        </div>
      </div>

      {/* 4. Edit / Inbound Modal */}
      {editingBranch && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card" style={{ maxWidth: '480px' }}>
            <div className="admin-modal-header">
              <h3>
                {modalMode === 'add_inbound' ? '🚛 Receive Inbound Farm Harvest' : '⚖️ Update Branch Stock (KG)'}
              </h3>
              <button className="modal-close-btn" onClick={() => setEditingBranch(null)}>&times;</button>
            </div>

            <form onSubmit={handleSaveModal}>
              <div className="admin-modal-body">
                <div style={{ background: '#faf5f8', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', border: '1px solid #ebd0e2' }}>
                  <strong style={{ fontSize: '14px', color: '#74114e' }}>{editingBranch.name} ({editingBranch.city})</strong>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                    Current Available: <strong>{(editingBranch.totalStockKg || 0).toLocaleString('en-IN')} kg</strong> &bull; Reserved: <strong>{calculateReservedKg(editingBranch.id)} kg</strong>
                  </div>
                </div>

                {/* Mode Selector */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                  <button 
                    type="button"
                    onClick={() => setModalMode('add_inbound')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: modalMode === 'add_inbound' ? '#0a6637' : '#d1d5db',
                      background: modalMode === 'add_inbound' ? '#e8f5e9' : '#ffffff',
                      color: modalMode === 'add_inbound' ? '#0a6637' : '#555',
                      fontWeight: 600,
                      fontSize: '12.5px',
                      cursor: 'pointer'
                    }}
                  >
                    + Log Inbound Truck (KG)
                  </button>
                  <button 
                    type="button"
                    onClick={() => setModalMode('set')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: modalMode === 'set' ? '#74114e' : '#d1d5db',
                      background: modalMode === 'set' ? '#faf5f8' : '#ffffff',
                      color: modalMode === 'set' ? '#74114e' : '#555',
                      fontWeight: 600,
                      fontSize: '12.5px',
                      cursor: 'pointer'
                    }}
                  >
                    Set Exact Total (KG)
                  </button>
                </div>

                {modalMode === 'add_inbound' ? (
                  <div className="admin-form-group">
                    <label>Inbound Kilograms to Add *</label>
                    <input 
                      type="number" 
                      min="1"
                      required 
                      placeholder="e.g. 2500"
                      value={inboundKg}
                      onChange={(e) => setInboundKg(e.target.value)}
                      style={{ fontSize: '18px', fontWeight: 'bold', color: '#0a6637' }}
                      autoFocus
                    />
                    <span style={{ fontSize: '11.5px', color: '#666', marginTop: '4px', display: 'block' }}>
                      New total will become: <strong>{((editingBranch.totalStockKg || 0) + (parseInt(inboundKg, 10) || 0)).toLocaleString('en-IN')} kg</strong>
                    </span>
                  </div>
                ) : (
                  <div className="admin-form-group">
                    <label>Total Available Stock (in KG) *</label>
                    <input 
                      type="number" 
                      min="0"
                      required 
                      value={newStockKg}
                      onChange={(e) => setNewStockKg(e.target.value)}
                      style={{ fontSize: '18px', fontWeight: 'bold', color: '#74114e' }}
                      autoFocus
                    />
                  </div>
                )}

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Min. Low Stock Alert (KG)</label>
                    <input 
                      type="number" 
                      min="100"
                      value={minThresholdKg}
                      onChange={(e) => setMinThresholdKg(e.target.value)}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Warehouse Max Capacity (KG)</label>
                    <input 
                      type="number" 
                      min="1000"
                      value={maxCapacityKg}
                      onChange={(e) => setMaxCapacityKg(e.target.value)}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Restock / Farm Lot Reference Note</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Nashik Valley Grade-A Harvest (Truck #PB02-8899)"
                    value={restockNote}
                    onChange={(e) => setRestockNote(e.target.value)}
                  />
                </div>

              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn secondary" onClick={() => setEditingBranch(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn primary">
                  Save Stock (KG)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
