import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { AppShell } from '@/components/AppShell'
import { formatDate, formatQuantity, isExpired, isExpiringSoon } from '@/lib/utils'

interface StockItem {
  id: string
  name: string
  currentQuantity: number
  unit: string
  expiryDate?: string | null
  location?: string | null
}

export default function Expiry() {
  const [items, setItems] = useState<StockItem[]>([])
  const [message, setMessage] = useState('')

  async function load() {
    const res = await fetch('/api/stock')
    if (res.ok) setItems(await res.json())
  }

  useEffect(() => {
    load()
  }, [])

  const datedItems = useMemo(() => {
    return items
      .filter((item) => item.expiryDate)
      .sort((a, b) => new Date(a.expiryDate || '').getTime() - new Date(b.expiryDate || '').getTime())
  }, [items])

  const expired = datedItems.filter((item) => isExpired(new Date(item.expiryDate || '')))
  const expiringSoon = datedItems.filter((item) => !isExpired(new Date(item.expiryDate || '')) && isExpiringSoon(new Date(item.expiryDate || ''), 14))

  async function runAutomation() {
    setMessage('')
    const res = await fetch('/api/automation/run', { method: 'POST' })
    const data = await res.json().catch(() => null)
    setMessage(res.ok ? data?.message || 'Expiry alerts refreshed.' : data?.error || 'Unable to refresh alerts.')
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Expiry</h1>
            <p className="mt-2 text-gray-600">Review expired and soon-to-expire stock before it becomes waste.</p>
          </div>
          <button onClick={runAutomation} className="rounded bg-accent px-4 py-2 text-white">Refresh alerts</button>
        </div>

        {message && <div className="rounded border bg-white p-3 text-sm text-gray-700">{message}</div>}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded border bg-white p-4">
            <p className="text-sm text-gray-500">Expired</p>
            <p className="mt-2 text-3xl font-semibold">{expired.length}</p>
          </div>
          <div className="rounded border bg-white p-4">
            <p className="text-sm text-gray-500">Expiring in 14 days</p>
            <p className="mt-2 text-3xl font-semibold">{expiringSoon.length}</p>
          </div>
          <div className="rounded border bg-white p-4">
            <p className="text-sm text-gray-500">Tracked with dates</p>
            <p className="mt-2 text-3xl font-semibold">{datedItems.length}</p>
          </div>
        </div>

        <section className="overflow-x-auto rounded border bg-white">
          <table className="min-w-full text-left">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-sm font-semibold">Item</th>
                <th className="p-3 text-sm font-semibold">Quantity</th>
                <th className="p-3 text-sm font-semibold">Expiry date</th>
                <th className="p-3 text-sm font-semibold">Location</th>
                <th className="p-3 text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {datedItems.length === 0 ? (
                <tr>
                  <td className="p-6 text-sm text-gray-500" colSpan={5}>No stock items have expiry dates yet.</td>
                </tr>
              ) : (
                datedItems.map((item) => {
                  const date = new Date(item.expiryDate || '')
                  const status = isExpired(date) ? 'Expired' : isExpiringSoon(date, 14) ? 'Soon' : 'OK'
                  return (
                    <tr key={item.id} className="border-t">
                      <td className="p-3"><Link className="text-blue-600 hover:underline" href={`/stock/${item.id}`}>{item.name}</Link></td>
                      <td className="p-3">{formatQuantity(item.currentQuantity, item.unit)}</td>
                      <td className="p-3">{formatDate(item.expiryDate)}</td>
                      <td className="p-3">{item.location || '-'}</td>
                      <td className="p-3">{status}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </section>
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
