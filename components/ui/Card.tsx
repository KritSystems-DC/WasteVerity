import React from 'react'

export default function Card({ children, className }: any) {
  return <div className={`p-4 border rounded ${className || ''}`}>{children}</div>
}
