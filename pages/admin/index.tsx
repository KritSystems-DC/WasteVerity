import { useEffect, useState } from 'react'
import { getSession, useSession } from 'next-auth/react'
import { GetServerSideProps } from 'next'
import { AppShell } from '@/components/AppShell'

interface AdminStats {
  totalBusinesses: number
  totalUsers: number
  totalSubscriptions: number
  activeSubscriptions: number
  pastDueSubscriptions: number
  activeAlerts: number
  automationEvents: number
}

export default function AdminIndex() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadStats() {
      const res = await fetch('/api/admin/stats')
      if (!res.ok) {
        setError('Unable to load admin statistics.')
        return
      }
      setStats(await res.json())
    }
    loadStats()
  }, [])

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Platform metrics for businesses, users and subscriptions.</p>
        </div>

        {error && <div className="text-red-600">{error}</div>}

        {stats ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 border rounded bg-white">
              <p className="text-sm text-gray-500">Businesses</p>
              <p className="mt-2 text-3xl font-semibold">{stats.totalBusinesses}</p>
            </div>
            <div className="p-4 border rounded bg-white">
              <p className="text-sm text-gray-500">Users</p>
              <p className="mt-2 text-3xl font-semibold">{stats.totalUsers}</p>
            </div>
            <div className="p-4 border rounded bg-white">
              <p className="text-sm text-gray-500">Active subscriptions</p>
              <p className="mt-2 text-3xl font-semibold">{stats.activeSubscriptions}</p>
            </div>
            <div className="p-4 border rounded bg-white">
              <p className="text-sm text-gray-500">Past due subscriptions</p>
              <p className="mt-2 text-3xl font-semibold">{stats.pastDueSubscriptions}</p>
            </div>
            <div className="p-4 border rounded bg-white">
              <p className="text-sm text-gray-500">Active alerts</p>
              <p className="mt-2 text-3xl font-semibold">{stats.activeAlerts}</p>
            </div>
            <div className="p-4 border rounded bg-white">
              <p className="text-sm text-gray-500">Automation events</p>
              <p className="mt-2 text-3xl font-semibold">{stats.automationEvents}</p>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-white border rounded">Loading admin metrics…</div>
        )}
      </div>
    </AppShell>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)
  if (!session) {
    return { redirect: { destination: '/login', permanent: false } }
  }
  if (session.user.role !== 'ADMIN') {
    return { redirect: { destination: '/dashboard', permanent: false } }
  }
  return { props: {} }
}
