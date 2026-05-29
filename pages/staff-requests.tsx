import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { getSession, useSession } from 'next-auth/react'
import { AppShell } from '@/components/AppShell'

interface StaffRequest {
  id: string
  itemName: string
  requestedQuantity: number
  reason?: string
  urgency: string
  status: string
}

interface StockItem {
  id: string
  name: string
  currentQuantity: number
  unit: string
}

export default function StaffRequests() {
  const { data: session } = useSession()
  const [requests, setRequests] = useState<StaffRequest[]>([])
  const [items, setItems] = useState<StockItem[]>([])
  const [stockItemId, setStockItemId] = useState('')
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [reason, setReason] = useState('')
  const [urgency, setUrgency] = useState('NORMAL')
  const [error, setError] = useState('')

  const canReview = session?.user?.role === 'OWNER' || session?.user?.role === 'ADMIN'

  async function load() {
    const [requestRes, stockRes] = await Promise.all([fetch('/api/staff-requests'), fetch('/api/stock')])
    if (requestRes.ok) setRequests(await requestRes.json())
    if (stockRes.ok) setItems(await stockRes.json())
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/staff-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stockItemId: stockItemId || undefined, itemName, requestedQuantity: quantity, reason, urgency })
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data?.error || 'Could not submit request')
      return
    }

    await load()
    setStockItemId('')
    setItemName('')
    setQuantity(1)
    setReason('')
    setUrgency('NORMAL')
  }

  async function review(id: string, action: 'approve' | 'reject' | 'add_to_reorder') {
    setError('')
    const res = await fetch(`/api/staff-requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error || 'Unable to update request.')
      return
    }
    await load()
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Staff requests</h1>
          <p className="mt-2 text-gray-600">Submit and review requests for low stock or missing supplies.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 max-w-xl bg-white border rounded p-6">
          <label className="block">
            <span className="font-medium">Existing stock item</span>
            <select className="w-full mt-1 p-2 border rounded" value={stockItemId} onChange={(e) => setStockItemId(e.target.value)}>
              <option value="">New or unlisted item</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>{item.name} ({item.currentQuantity} {item.unit})</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="font-medium">Item name</span>
            <input className="w-full mt-1 p-2 border rounded" value={itemName} onChange={(e) => setItemName(e.target.value)} required={!stockItemId} />
          </label>
          <label className="block">
            <span className="font-medium">Quantity</span>
            <input type="number" min={1} className="w-full mt-1 p-2 border rounded" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required />
          </label>
          <label className="block">
            <span className="font-medium">Urgency</span>
            <select className="w-full mt-1 p-2 border rounded" value={urgency} onChange={(e) => setUrgency(e.target.value)}>
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </label>
          <label className="block">
            <span className="font-medium">Reason</span>
            <textarea className="w-full mt-1 p-2 border rounded" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
          </label>

          {error && <div className="text-sm text-red-600">{error}</div>}
          <button className="bg-accent text-white px-4 py-2 rounded w-full">Submit request</button>
        </form>

        <section className="bg-white border rounded p-6">
          <h2 className="text-xl font-semibold mb-4">Recent requests</h2>
          {requests.length === 0 ? (
            <p className="text-gray-600">No requests yet.</p>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div key={request.id} className="border rounded p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold">{request.itemName}</p>
                      <p className="text-sm text-gray-500">Qty: {request.requestedQuantity} · Urgency: {request.urgency}</p>
                    </div>
                    <div className="rounded-full px-3 py-1 text-sm bg-gray-100 self-start sm:self-auto">{request.status}</div>
                  </div>
                  {request.reason && <p className="mt-2 text-gray-700">{request.reason}</p>}
                  {canReview && request.status === 'PENDING' && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button onClick={() => review(request.id, 'approve')} className="rounded bg-accent px-3 py-2 text-sm text-white">Approve</button>
                      <button onClick={() => review(request.id, 'add_to_reorder')} className="rounded border border-slate-200 px-3 py-2 text-sm">Add to reorder</button>
                      <button onClick={() => review(request.id, 'reject')} className="rounded border border-red-200 px-3 py-2 text-sm text-red-700">Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
