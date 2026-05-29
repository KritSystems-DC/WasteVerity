import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { AppShell } from '@/components/AppShell'

const units = ['item', 'box', 'pack', 'bottle', 'litre', 'ml', 'kg', 'gram', 'tray', 'bag', 'roll', 'pair', 'case', 'crate', 'custom']

export default function EditStockItem() {
  const router = useRouter()
  const { id } = router.query
  const [item, setItem] = useState<any>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!id || typeof id !== 'string') return
    fetch(`/api/stock/${id}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setItem(data))
  }, [id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!item || !id || typeof id !== 'string') return
    const res = await fetch(`/api/stock/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    })
    if (res.ok) {
      setMessage('Stock item updated successfully.')
      router.push(`/stock/${id}`)
    } else {
      const data = await res.json().catch(() => null)
      setMessage(data?.error || 'Unable to save stock item.')
    }
  }

  function updateField(field: string, value: any) {
    setItem((prev: any) => ({ ...prev, [field]: value }))
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Edit stock item</h1>
          <p className="mt-2 text-gray-600">Update quantities, pricing, expiry and reorder settings.</p>
        </div>

        {!item ? (
          <div className="bg-white border rounded p-6">Loading stock item…</div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4 max-w-3xl bg-white border rounded p-6">
            <label className="block">
              <span className="font-medium">Name</span>
              <input className="w-full mt-1 p-2 border rounded" value={item.name || ''} onChange={(e) => updateField('name', e.target.value)} required />
            </label>
            <label className="block">
              <span className="font-medium">SKU / code</span>
              <input className="w-full mt-1 p-2 border rounded" value={item.sku || ''} onChange={(e) => updateField('sku', e.target.value)} />
            </label>
            <label className="block">
              <span className="font-medium">Category</span>
              <input className="w-full mt-1 p-2 border rounded" value={item.category || ''} onChange={(e) => updateField('category', e.target.value)} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="font-medium">Current quantity</span>
                <input type="number" className="w-full mt-1 p-2 border rounded" value={item.currentQuantity || 0} min={0} onChange={(e) => updateField('currentQuantity', Number(e.target.value))} required />
              </label>
              <label className="block">
                <span className="font-medium">Minimum quantity</span>
                <input type="number" className="w-full mt-1 p-2 border rounded" value={item.minimumQuantity || 0} min={0} onChange={(e) => updateField('minimumQuantity', Number(e.target.value))} required />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="font-medium">Reorder amount</span>
                <input type="number" className="w-full mt-1 p-2 border rounded" value={item.reorderAmount || 0} min={0} onChange={(e) => updateField('reorderAmount', Number(e.target.value))} required />
              </label>
              <label className="block">
                <span className="font-medium">Unit</span>
                <select className="w-full mt-1 p-2 border rounded" value={item.unit || 'item'} onChange={(e) => updateField('unit', e.target.value)}>
                  {units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                </select>
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="font-medium">Cost per unit</span>
                <input type="number" step="0.01" className="w-full mt-1 p-2 border rounded" value={item.costPerUnit || 0} min={0} onChange={(e) => updateField('costPerUnit', Number(e.target.value))} required />
              </label>
              <label className="block">
                <span className="font-medium">Selling price</span>
                <input type="number" step="0.01" className="w-full mt-1 p-2 border rounded" value={item.sellingPrice || ''} min={0} onChange={(e) => updateField('sellingPrice', e.target.value ? Number(e.target.value) : undefined)} />
              </label>
            </div>
            <label className="block">
              <span className="font-medium">Expiry date</span>
              <input type="date" className="w-full mt-1 p-2 border rounded" value={item.expiryDate ? new Date(item.expiryDate).toISOString().substring(0, 10) : ''} onChange={(e) => updateField('expiryDate', e.target.value || undefined)} />
            </label>
            <label className="block">
              <span className="font-medium">Location / storage</span>
              <input className="w-full mt-1 p-2 border rounded" value={item.location || ''} onChange={(e) => updateField('location', e.target.value)} />
            </label>
            <label className="block">
              <span className="font-medium">Notes</span>
              <textarea className="w-full mt-1 p-2 border rounded" value={item.notes || ''} onChange={(e) => updateField('notes', e.target.value)} rows={4} />
            </label>
            <div className="flex items-center gap-3">
              <button type="submit" className="bg-accent text-white px-4 py-2 rounded">Save changes</button>
              {message && <p className="text-sm text-gray-700">{message}</p>}
            </div>
          </form>
        )}
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
