import React from 'react'
import { Sidebar, NavLink } from './Sidebar'
import { Header } from './Header'
import { useSession } from 'next-auth/react'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { data: session } = useSession()
  const role = (session as any)?.user?.role

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar>
        <NavLink href="/dashboard">Dashboard</NavLink>
        <NavLink href="/stock">Stock</NavLink>
        <NavLink href="/suppliers">Suppliers</NavLink>
        <NavLink href="/reorder">Reorder</NavLink>
        <NavLink href="/expiry">Expiry</NavLink>
        <NavLink href="/staff-requests">Staff requests</NavLink>
        <NavLink href="/reports">Reports</NavLink>
        <NavLink href="/automation-logs">Automation logs</NavLink>
        <NavLink href="/billing">Billing</NavLink>
        <NavLink href="/settings">Settings</NavLink>
        {(role === 'ADMIN' || role === 'OWNER') && <NavLink href="/admin">Admin</NavLink>}
      </Sidebar>
      <div className="md:pl-72">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
