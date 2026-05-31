import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { getSession } from 'next-auth/react'
import { GetServerSideProps } from 'next'
import { AppShell } from '@/components/AppShell'
import { formatDate } from '@/lib/utils'

interface BusinessRow {
  id: string
  name: string
  type: string
  email: string | null
  country: string | null
  currency: string | null
  status: string
  subscriptions: Array<{ plan: string; status: string; currentPeriodEnd?: string | null }>
}

export default function AdminBusinesses() {
  const [businesses, setBusinesses] = useState<BusinessRow[]>([])
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ q: '', status: '' })

  const loadBusinesses = useCallback(async () => {
    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.status) params.set('status', filters.status)
    const res = await fetch(`/api/admin/businesses${params.toString() ? `?${params}` : ''}`)
    if (!res.ok) {
      setError('Unable to load business list.')
      return
    }
    setError('')
    setBusinesses(await res.json())
  }, [filters])

  useEffect(() => {
    loadBusinesses()
  }, [loadBusinesses])

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Businesses</h1>
          <p className="mt-2 text-gray-600">View platform businesses and subscription status.</p>
        </div>

        {error && <div className="text-red-600">{error}</div>}

        <div className="grid gap-3 bg-white border rounded p-4 md:grid-cols-3">
          <input className="border rounded px-3 py-2" placeholder="Search name or owner email" value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} />
          <select className="border rounded px-3 py-2" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
            <option value="">All statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="DISABLED">DISABLED</option>
            <option value="SETUP_REQUIRED">SETUP_REQUIRED</option>
          </select>
          <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700" onClick={loadBusinesses}>Apply filters</button>
        </div>

        <div className="overflow-x-auto bg-white border rounded">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renewal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {businesses.map((business) => (
                <tr key={business.id}>
                  <td className="px-4 py-3 text-sm text-gray-700"><Link href={`/admin/businesses/${business.id}`} className="text-blue-600 hover:underline">{business.name}</Link></td>
                  <td className="px-4 py-3 text-sm text-gray-700">{business.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{business.status}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {business.subscriptions.length > 0
                      ? business.subscriptions.map((subscription) => `${subscription.plan} / ${subscription.status}`).join(', ')
                      : 'No subscription'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {business.subscriptions[0]?.currentPeriodEnd ? formatDate(business.subscriptions[0].currentPeriodEnd) : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
