import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { AppShell } from '@/components/AppShell'

interface StockItem {
  id: string
  name: string
  currentQuantity: number
  unit: string
}

const movementTypes = [
  { value: 'MANUAL_ADJUSTMENT', label: 'Manual adjustment' },
  { value: 'STOCK_USED', label: 'Stock used' },
  { value: 'RESTOCKED', label: 'Restocked' },
  { value: 'WASTED', label: 'Wasted' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'CORRECTION', label: 'Correction' },
  { value: 'RETURNED', label: 'Returned' },
]

export default function AdjustStock() {
  const router = useRouter()
  const [items, setItems] = useState<StockItem[]>([])
  const [stockItemId, setStockItemId] = useState('')
  const [quantityChange, setQuantityChange] = useState(0)
  const [type, setType] = useState('MANUAL_ADJUSTMENT')
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/stock')
      if (res.ok) setItems(await res.json())
    }
    load()
  }, [])

  useEffect(() => {
    const item = router.query.item
    if (typeof item === 'string') setStockItemId(item)
  }, [router.query.item])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage('')
    const res = await fetch('/api/stock/adjust', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stockItemId, quantityChange, type, reason }),
    })
    if (res.ok) {
      setMessage('Stock adjustment saved.')
      setQuantityChange(0)
      setReason('')
      const next = await fetch('/api/stock')
      if (next.ok) setItems(await next.json())
    } else {
      const data = await res.json().catch(() => null)
      setMessage(data?.error || 'Unable to adjust stock.')
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Adjust stock</h1>
          <p className="mt-2 text-gray-600">Record usage, restocks, wastage and corrections for your stock items.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 max-w-2xl bg-white border rounded p-6">
          <label className="block">
            <span className="font-medium">Stock item</span>
            <select className="w-full mt-1 p-2 border rounded" value={stockItemId} onChange={(e) => setStockItemId(e.target.value)} required>
              <option value="">Select an item</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>{item.name} ({item.currentQuantity} {item.unit})</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="font-medium">Adjustment type</span>
            <select className="w-full mt-1 p-2 border rounded" value={type} onChange={(e) => setType(e.target.value)}>
              {movementTypes.map((entry) => <option key={entry.value} value={entry.value}>{entry.label}</option>)}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="font-medium">Quantity change</span>
              <input type="number" className="w-full mt-1 p-2 border rounded" value={quantityChange} onChange={(e) => setQuantityChange(Number(e.target.value))} required />
            </label>
            <label className="block">
              <span className="font-medium">Reason</span>
              <input className="w-full mt-1 p-2 border rounded" value={reason} onChange={(e) => setReason(e.target.value)} />
            </label>
          </div>

          <button type="submit" className="bg-accent text-white px-4 py-2 rounded">Save adjustment</button>
          {message && <p className="text-sm text-gray-700">{message}</p>}
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
