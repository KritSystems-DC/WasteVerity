import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { AppShell } from '@/components/AppShell'
import { formatDateTime } from '@/lib/utils'

interface LogRow {
  id: string
  business?: { name: string }
  type: string
  title: string
  status: string
  createdAt: string
}

export default function AdminLogs() {
  const [logs, setLogs] = useState<LogRow[]>([])
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ businessId: '', type: '', status: '' })

  async function load(nextFilters = filters) {
    const params = new URLSearchParams()
    if (nextFilters.businessId) params.set('businessId', nextFilters.businessId)
    if (nextFilters.type) params.set('type', nextFilters.type)
    if (nextFilters.status) params.set('status', nextFilters.status)
    const res = await fetch(`/api/admin/logs${params.toString() ? `?${params}` : ''}`)
    if (!res.ok) {
      setError('Failed to load logs.')
      return
    }
    setError('')
    setLogs(await res.json())
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Automation logs</h1>
          <p className="mt-2 text-gray-600">Review platform automation and notification events.</p>
        </div>

        {error && <div className="text-red-600">{error}</div>}

        <div className="grid gap-3 bg-white border rounded p-4 md:grid-cols-4">
          <input className="border rounded px-3 py-2" placeholder="Business ID" value={filters.businessId} onChange={(event) => setFilters({ ...filters, businessId: event.target.value })} />
          <input className="border rounded px-3 py-2" placeholder="Type" value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })} />
          <select className="border rounded px-3 py-2" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
            <option value="">All statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILED">FAILED</option>
            <option value="INFO">INFO</option>
          </select>
          <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700" onClick={() => load()}>Apply filters</button>
        </div>

        <div className="overflow-x-auto bg-white border rounded">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 text-sm text-gray-700">{log.business?.name || 'Platform'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{log.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{log.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{log.status}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{formatDateTime(new Date(log.createdAt))}</td>
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
