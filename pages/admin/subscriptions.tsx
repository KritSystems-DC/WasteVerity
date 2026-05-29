import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { AppShell } from '@/components/AppShell'
import { formatDate } from '@/lib/utils'

interface SubscriptionRow {
  id: string
  business: { name: string }
  plan: string
  status: string
  currentPeriodEnd?: string | null
}

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/subscriptions')
      if (!res.ok) {
        setError('Failed to load subscriptions.')
        return
      }
      setSubscriptions(await res.json())
    }
    load()
  }, [])

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Subscriptions</h1>
          <p className="mt-2 text-gray-600">View platform subscription status and billing plans.</p>
        </div>

        {error && <div className="text-red-600">{error}</div>}

        <div className="overflow-x-auto bg-white border rounded">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renewal date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subscriptions.map((sub) => (
                <tr key={sub.id}>
                  <td className="px-4 py-3 text-sm text-gray-700">{sub.business.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{sub.plan}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{sub.status}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{sub.currentPeriodEnd ? formatDate(new Date(sub.currentPeriodEnd)) : 'N/A'}</td>
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
