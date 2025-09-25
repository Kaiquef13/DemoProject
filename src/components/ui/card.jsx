import React from 'react'

export function Card({ className = '', children, ...props }) {
  return (
    <div
      className={className}
      style={{ border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardContent({ className = '', children, ...props }) {
  return (
    <div className={className} style={{ padding: 16 }} {...props}>
      {children}
    </div>
  )
}

