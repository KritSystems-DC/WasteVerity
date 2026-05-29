import React from 'react'

export default function Badge({ children, color = 'gray' }: any) {
  const colorClass = color === 'green' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  return <span className={`px-2 py-1 rounded text-sm ${colorClass}`}>{children}</span>
}
