import React from 'react'
import clsx from 'clsx'

export default function Button({ children, className, ...props }: any) {
  return (
    <button className={clsx('inline-block px-4 py-2 rounded bg-accent text-white', className)} {...props}>
      {children}
    </button>
  )
}
