import { useState } from 'react'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { AppShell } from '@/components/AppShell'

export default function NewStock() {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [minimumQuantity, setMinimumQuantity] = useState(0)
  const [reorderAmount, setReorderAmount] = useState(0)
  const [unit, setUnit] = useState('item')
  const [costPerUnit, setCostPerUnit] = useState(0)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const res = await fetch('/api/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, currentQuantity: quantity, minimumQuantity, reorderAmount, unit, costPerUnit })
    })
    if (res.ok) {
      setMessage('Stock item created successfully.')
      setName('')
      setQuantity(0)
      setMinimumQuantity(0)
      setReorderAmount(0)
      setCostPerUnit(0)
    } else {
      const data = await res.json()
      setMessage(data.error || 'Failed to create item.')
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Add Stock Item</h1>
          <p className="mt-2 text-gray-600">Create a new stock item and track quantity, cost, and reorder settings.</p>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-4 max-w-xl bg-white border rounded p-6">
          <label className="block">
            <span className="font-medium">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 p-2 border rounded" required />
          </label>
          <label className="block">
            <span className="font-medium">Current quantity</span>
            <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full mt-1 p-2 border rounded" min={0} />
          </label>
          <label className="block">
            <span className="font-medium">Minimum quantity</span>
            <input type="number" value={minimumQuantity} onChange={(e) => setMinimumQuantity(Number(e.target.value))} className="w-full mt-1 p-2 border rounded" min={0} />
          </label>
          <label className="block">
            <span className="font-medium">Reorder amount</span>
            <input type="number" value={reorderAmount} onChange={(e) => setReorderAmount(Number(e.target.value))} className="w-full mt-1 p-2 border rounded" min={0} />
          </label>
          <label className="block">
            <span className="font-medium">Unit</span>
            <input value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full mt-1 p-2 border rounded" />
          </label>
          <label className="block">
            <span className="font-medium">Cost per unit</span>
            <input type="number" step="0.01" value={costPerUnit} onChange={(e) => setCostPerUnit(Number(e.target.value))} className="w-full mt-1 p-2 border rounded" min={0} />
          </label>
          <button className="bg-accent text-white px-4 py-2 rounded">Save item</button>
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
