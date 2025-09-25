import React from 'react'

export const Input = React.forwardRef(function Input(
  { className = '', style, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={className}
      style={{
        padding: '8px 10px',
        borderRadius: 6,
        border: '1px solid #d1d5db',
        outline: 'none',
        ...style
      }}
      {...props}
    />
  )
})

