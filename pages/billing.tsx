import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { AppShell } from '@/components/AppShell'
import { formatDate } from '@/lib/utils'

interface SubscriptionStatus {
  plan: string
  status: string
  currentPeriodEnd?: string | null
  cancelAtPeriodEnd: boolean
}

export default function Billing() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/billing/status')
      if (res.ok) {
        const data = await res.json()
        setSubscription(data.subscription)
      }
    }
    load()
  }, [])

  async function handleCheckout() {
    setLoading(true)
    setMessage('')
    const res = await fetch('/api/stripe/create-checkout-session', { method: 'POST' })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setMessage(data.error || 'Unable to start checkout.')
      return
    }
    if (data.url) {
      window.location.href = data.url
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Billing</h1>
          <p className="mt-2 text-gray-600">Manage your subscription and payment checkout.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-white border rounded p-6 space-y-3">
            <h2 className="text-lg font-semibold">Current plan</h2>
            {subscription ? (
              <>
                <p>Plan: {subscription.plan}</p>
                <p>Status: {subscription.status}</p>
                <p>Renews: {subscription.currentPeriodEnd ? formatDate(new Date(subscription.currentPeriodEnd)) : 'Not set'}</p>
                {subscription.cancelAtPeriodEnd && <p className="text-sm text-amber-700">Cancellation is scheduled for the end of the period.</p>}
              </>
            ) : (
              <p className="text-gray-600">No subscription is recorded for this business yet.</p>
            )}
          </div>

          <div className="bg-white border rounded p-6 space-y-4">
            <h2 className="text-lg font-semibold">Stripe checkout</h2>
            <p className="text-gray-700">Start checkout to activate or update the business subscription.</p>
            <button
              onClick={handleCheckout}
              className="inline-flex items-center px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'Redirecting...' : 'Checkout with Stripe'}
            </button>
            {message && <p className="text-sm text-red-600">{message}</p>}
          </div>
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
