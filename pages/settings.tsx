import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { AppShell } from '@/components/AppShell'

export default function Settings() {
  const [preferences, setPreferences] = useState({
    lowStockAlertEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    whatsappEnabled: false,
    emailFrom: '',
    smsProvider: '',
    whatsappProvider: '',
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadPreferences() {
      const res = await fetch('/api/notifications/preferences')
      if (res.ok) setPreferences(await res.json())
    }
    loadPreferences()
  }, [])

  async function savePreferences(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    setError('')
    const res = await fetch('/api/notifications/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Unable to save notification preferences.')
      return
    }
    setPreferences(data)
    setMessage('Notification preferences saved.')
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="mt-2 text-gray-600">Manage business details and stock defaults.</p>
        </div>
        <div className="bg-white border rounded p-6">
          <h2 className="text-lg font-semibold">Business setup</h2>
          <p className="mt-2 text-sm text-gray-600">Update your business profile, currency, default unit and low stock alerts.</p>
          <Link href="/setup" className="mt-4 inline-flex rounded bg-accent px-4 py-2 text-white">Open setup</Link>
        </div>

        <form onSubmit={savePreferences} className="bg-white border rounded p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Notification preferences</h2>
            <p className="mt-2 text-sm text-gray-600">Control alert channels and provider labels for operational notifications.</p>
          </div>

          {message && <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>}
          {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={preferences.lowStockAlertEnabled} onChange={(event) => setPreferences({ ...preferences, lowStockAlertEnabled: event.target.checked })} />
              Low stock alerts
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={preferences.emailEnabled} onChange={(event) => setPreferences({ ...preferences, emailEnabled: event.target.checked })} />
              Email notifications
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={preferences.smsEnabled} onChange={(event) => setPreferences({ ...preferences, smsEnabled: event.target.checked })} />
              SMS notifications
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={preferences.whatsappEnabled} onChange={(event) => setPreferences({ ...preferences, whatsappEnabled: event.target.checked })} />
              WhatsApp notifications
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-1 text-sm">
              <span className="block font-medium text-gray-700">Email sender</span>
              <input className="w-full border rounded px-3 py-2" value={preferences.emailFrom} onChange={(event) => setPreferences({ ...preferences, emailFrom: event.target.value })} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="block font-medium text-gray-700">SMS provider</span>
              <input className="w-full border rounded px-3 py-2" value={preferences.smsProvider} onChange={(event) => setPreferences({ ...preferences, smsProvider: event.target.value })} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="block font-medium text-gray-700">WhatsApp provider</span>
              <input className="w-full border rounded px-3 py-2" value={preferences.whatsappProvider} onChange={(event) => setPreferences({ ...preferences, whatsappProvider: event.target.value })} />
            </label>
          </div>

          <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Save notification preferences</button>
        </form>
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
