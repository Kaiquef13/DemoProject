import React from 'react'

export function Badge({ className = '', children, ...props }) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 999,
        background: '#e5e7eb',
        color: '#111827',
        fontSize: 12,
        fontWeight: 500
      }}
      {...props}
    >
      {children}
    </span>
  )
}

