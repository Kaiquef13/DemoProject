import React from 'react'

export function Progress({ value = 0, className = '', ...props }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0))
  return (
    <div className={className} style={{ width: '100%', height: 8, background: '#e5e7eb', borderRadius: 999 }} {...props}>
      <div style={{ width: `${v}%`, height: '100%', background: '#2563eb', borderRadius: 999 }} />
    </div>
  )
}

