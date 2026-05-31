import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { AppShell } from '@/components/AppShell'
import { formatDate } from '@/lib/utils'

export default function AdminBusinessDetail() {
  const router = useRouter()
  const { id } = router.query
  const [business, setBusiness] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id || typeof id !== 'string') return
    fetch(`/api/admin/businesses/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Unable to load business')
        return res.json()
      })
      .then((data) => setBusiness(data))
      .catch(() => setError('Unable to load business details.'))
  }, [id])

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Business details</h1>
            <p className="mt-2 text-gray-600">Review the selected business account and subscription details.</p>
          </div>
        </div>

        {error && <div className="text-red-600">{error}</div>}

        {!business ? (
          <div className="bg-white border rounded p-6">Loading business details…</div>
        ) : (
          <div className="grid gap-4 max-w-3xl">
            <div className="bg-white border rounded p-6 space-y-3">
              <p><strong>Name:</strong> {business.name}</p>
              <p><strong>Type:</strong> {business.type}</p>
              <p><strong>Email:</strong> {business.email}</p>
              <p><strong>Phone:</strong> {business.phone || '—'}</p>
              <p><strong>Country:</strong> {business.country || '—'}</p>
              <p><strong>Currency:</strong> {business.currency}</p>
              <p><strong>Status:</strong> {business.status}</p>
              <p><strong>Created:</strong> {formatDate(new Date(business.createdAt))}</p>
            </div>
            <div className="bg-white border rounded p-6">
              <h2 className="text-lg font-semibold">Subscription</h2>
              {business.subscriptions?.length ? (
                <div className="space-y-2 mt-3">
                  {business.subscriptions.map((sub: any) => (
                    <div key={sub.id} className="p-3 border rounded">
                      <p><strong>Plan:</strong> {sub.plan}</p>
                      <p><strong>Status:</strong> {sub.status}</p>
                      <p><strong>Renewal:</strong> {sub.currentPeriodEnd ? formatDate(new Date(sub.currentPeriodEnd)) : 'N/A'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-gray-500">No subscription data available.</p>
              )}
            </div>
            <div className="bg-white border rounded p-6">
              <h2 className="text-lg font-semibold">Users</h2>
              <div className="mt-3 space-y-2">
                {business.users?.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between border rounded p-3 text-sm">
                    <span>{user.name} ({user.email})</span>
                    <span>{user.role}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border rounded p-6">
              <h2 className="text-lg font-semibold">Recent logs</h2>
              <div className="mt-3 space-y-2">
                {business.automationLogs?.map((log: any) => (
                  <div key={log.id} className="border rounded p-3 text-sm">
                    <p className="font-medium">{log.title}</p>
                    <p className="text-gray-600">{log.type} / {log.status}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
