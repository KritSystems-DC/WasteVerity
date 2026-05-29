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

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/logs')
      if (!res.ok) {
        setError('Failed to load logs.')
        return
      }
      setLogs(await res.json())
    }
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
