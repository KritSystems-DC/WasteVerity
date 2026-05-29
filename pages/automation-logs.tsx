import { useEffect, useState } from 'react'
import { getSession, useSession } from 'next-auth/react'
import { GetServerSideProps } from 'next'
import { AppShell } from '@/components/AppShell'
import { formatDateTime } from '@/lib/utils'

interface AutomationLogEntry {
  id: string
  type: string
  title: string
  message: string
  status: string
  businessId?: string | null
  createdAt: string
}

export default function AutomationLogs() {
  const { data: session } = useSession()
  const [logs, setLogs] = useState<AutomationLogEntry[]>([])
  const [statusMessage, setStatusMessage] = useState('')
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    async function loadLogs() {
      const res = await fetch('/api/automation/logs')
      if (res.ok) {
        setLogs(await res.json())
      }
    }
    loadLogs()
  }, [])

  async function handleRunAutomation() {
    if (!session?.user?.businessId) {
      setStatusMessage('Alert automation can only be run for a business account.')
      return
    }
    setIsRunning(true)
    const res = await fetch('/api/automation/run', { method: 'POST' })
    const data = await res.json()
    setStatusMessage(res.ok ? data.message : data.error || 'Automation run failed')
    setIsRunning(false)
    if (res.ok) {
      const refreshed = await fetch('/api/automation/logs')
      if (refreshed.ok) setLogs(await refreshed.json())
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Automation Logs</h1>
            <p className="mt-2 text-gray-600">Review automation events and refresh the alert automation flow.</p>
          </div>
          <button
            className="inline-flex items-center px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleRunAutomation}
            disabled={isRunning}
          >
            {isRunning ? 'Running…' : 'Run alert automation'}
          </button>
        </div>

        {statusMessage && <div className="text-sm text-gray-700">{statusMessage}</div>}

        <div className="overflow-x-auto bg-white border rounded">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 text-sm text-gray-700">{log.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{log.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{log.message}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{log.status}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{formatDateTime(log.createdAt)}</td>
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
  if (!session?.user?.businessId) {
    return { redirect: { destination: '/login', permanent: false } }
  }
  return { props: {} }
}
