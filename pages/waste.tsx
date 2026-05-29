import { useEffect, useMemo, useState } from 'react'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { AppShell } from '@/components/AppShell'
import { formatCurrency, formatDateTime, formatQuantity } from '@/lib/utils'

interface StockItem {
  id: string
  name: string
  currentQuantity: number
  unit: string
}

interface WasteRecord {
  id: string
  quantity: number
  estimatedCostLost: string
  reason?: string | null
  createdAt: string
  stockItem: { name: string; unit: string }
  user: { name: string; email: string }
}

export default function Waste() {
  const [items, setItems] = useState<StockItem[]>([])
  const [records, setRecords] = useState<WasteRecord[]>([])
  const [stockItemId, setStockItemId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')

  async function load() {
    const [stockRes, wasteRes] = await Promise.all([fetch('/api/stock'), fetch('/api/waste')])
    if (stockRes.ok) setItems(await stockRes.json())
    if (wasteRes.ok) setRecords(await wasteRes.json())
  }

  useEffect(() => {
    load()
  }, [])

  const totalLoss = useMemo(() => {
    return records.reduce((sum, record) => sum + Number(record.estimatedCostLost), 0)
  }, [records])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage('')
    const res = await fetch('/api/waste', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stockItemId, quantity, reason }),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      setMessage(data?.error || 'Unable to record waste.')
      return
    }
    setStockItemId('')
    setQuantity(1)
    setReason('')
    setMessage('Waste recorded.')
    await load()
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Waste</h1>
          <p className="mt-2 text-gray-600">Record discarded stock and track estimated cost lost.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded border bg-white p-4">
            <p className="text-sm text-gray-500">Waste records</p>
            <p className="mt-2 text-3xl font-semibold">{records.length}</p>
          </div>
          <div className="rounded border bg-white p-4">
            <p className="text-sm text-gray-500">Estimated loss</p>
            <p className="mt-2 text-3xl font-semibold">{formatCurrency(totalLoss)}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 max-w-2xl rounded border bg-white p-6">
          <label className="block">
            <span className="font-medium">Stock item</span>
            <select className="mt-1 w-full rounded border p-2" value={stockItemId} onChange={(e) => setStockItemId(e.target.value)} required>
              <option value="">Select an item</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>{item.name} ({item.currentQuantity} {item.unit})</option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="font-medium">Quantity wasted</span>
              <input type="number" min={1} className="mt-1 w-full rounded border p-2" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required />
            </label>
            <label className="block">
              <span className="font-medium">Reason</span>
              <input className="mt-1 w-full rounded border p-2" value={reason} onChange={(e) => setReason(e.target.value)} />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded bg-accent px-4 py-2 text-white">Record waste</button>
            {message && <p className="text-sm text-gray-700">{message}</p>}
          </div>
        </form>

        <section className="overflow-x-auto rounded border bg-white">
          <table className="min-w-full text-left">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-sm font-semibold">Item</th>
                <th className="p-3 text-sm font-semibold">Quantity</th>
                <th className="p-3 text-sm font-semibold">Loss</th>
                <th className="p-3 text-sm font-semibold">Reason</th>
                <th className="p-3 text-sm font-semibold">Recorded by</th>
                <th className="p-3 text-sm font-semibold">When</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td className="p-6 text-sm text-gray-500" colSpan={6}>No waste recorded yet.</td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="border-t">
                    <td className="p-3">{record.stockItem.name}</td>
                    <td className="p-3">{formatQuantity(record.quantity, record.stockItem.unit)}</td>
                    <td className="p-3">{formatCurrency(Number(record.estimatedCostLost))}</td>
                    <td className="p-3">{record.reason || '-'}</td>
                    <td className="p-3">{record.user.name}</td>
                    <td className="p-3">{formatDateTime(record.createdAt)}</td>
                  </tr>
                ))
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
