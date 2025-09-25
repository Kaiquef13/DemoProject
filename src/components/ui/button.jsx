import React from 'react'

export function Button({ className = '', children, disabled, ...props }) {
  return (
    <button
      disabled={disabled}
      className={className}
      style={{
        padding: '8px 12px',
        borderRadius: 6,
        border: '1px solid #d1d5db',
        background: disabled ? '#e5e7eb' : '#2563eb',
        color: disabled ? '#6b7280' : '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
      {...props}
    >
      {children}
    </button>
  )
}

