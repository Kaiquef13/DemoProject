import React from 'react'

export function Switch({ checked = false, onCheckedChange, className = '', ...props }) {
  return (
    <label className={className} style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: 8 }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        style={{ display: 'none' }}
        {...props}
      />
      <span
        aria-hidden="true"
        style={{
          width: 40,
          height: 22,
          background: checked ? '#22c55e' : '#e5e7eb',
          borderRadius: 999,
          position: 'relative',
          transition: 'background .2s'
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: checked ? 20 : 2,
            width: 18,
            height: 18,
            background: '#fff',
            borderRadius: '50%',
            transition: 'left .2s'
          }}
        />
      </span>
    </label>
  )
}

