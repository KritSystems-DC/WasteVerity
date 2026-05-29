import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { AppShell } from '@/components/AppShell'
import { formatCurrency, formatDate, formatQuantity } from '@/lib/utils'

interface StockItem {
  id: string
  name: string
  sku?: string | null
  category?: string | null
  currentQuantity: number
  minimumQuantity: number
  reorderAmount: number
  unit: string
  costPerUnit: string
  sellingPrice?: string | null
  expiryDate?: string | null
  location?: string | null
  notes?: string | null
  status: string
  supplier?: { name: string } | null
  priceHistories?: Array<{ id: string; oldPrice: string; newPrice: string; reason?: string | null; createdAt: string }>
}

export default function StockDetail() {
  const router = useRouter()
  const { id } = router.query
  const [item, setItem] = useState<StockItem | null>(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/stock/${id}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setItem(data))
  }, [id])

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Stock item</h1>
          <p className="mt-2 text-gray-600">Review stock details and price history for this item.</p>
        </div>

        {item ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">{item.name}</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/stock/${item.id}/edit`} className="rounded bg-accent px-4 py-2 text-white hover:bg-accent/90">Edit item</Link>
                <Link href={`/stock/adjust?item=${item.id}`} className="rounded border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50">Adjust stock</Link>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-white border rounded p-6 space-y-3">
                <h2 className="text-lg font-semibold">{item.name}</h2>
                <p>SKU: {item.sku || '-'}</p>
                <p>Category: {item.category || '-'}</p>
                <p>Supplier: {item.supplier?.name || '-'}</p>
                <p>Current quantity: {formatQuantity(item.currentQuantity, item.unit)}</p>
                <p>Minimum quantity: {formatQuantity(item.minimumQuantity, item.unit)}</p>
                <p>Reorder amount: {formatQuantity(item.reorderAmount, item.unit)}</p>
                <p>Cost per unit: {formatCurrency(Number(item.costPerUnit))}</p>
                <p>Selling price: {item.sellingPrice ? formatCurrency(Number(item.sellingPrice)) : '-'}</p>
                <p>Expiry: {item.expiryDate ? formatDate(new Date(item.expiryDate)) : '-'}</p>
                <p>Status: {item.status}</p>
                <p>Location: {item.location || '-'}</p>
                <p>Notes: {item.notes || '-'}</p>
              </div>

              <div className="bg-white border rounded p-6">
                <h2 className="text-lg font-semibold">Price history</h2>
                {item.priceHistories?.length ? (
                  <div className="mt-4 space-y-3">
                    {item.priceHistories.map((entry) => (
                      <div key={entry.id} className="rounded border p-3 text-sm">
                        <p>{formatCurrency(Number(entry.oldPrice))} to {formatCurrency(Number(entry.newPrice))}</p>
                        <p className="text-gray-500">{formatDate(new Date(entry.createdAt))}</p>
                        {entry.reason && <p className="mt-1 text-gray-700">{entry.reason}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-gray-500">No price changes recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border rounded p-6">Loading item details...</div>
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
