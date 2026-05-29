import Link from 'next/link'
import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { AppShell } from '@/components/AppShell'
import { formatCurrency, formatDate, formatQuantity } from '@/lib/utils'

interface StockItem {
  id: string
  name: string
  currentQuantity: number
  minimumQuantity: number
  reorderAmount: number
  unit: string
  costPerUnit: string
  sellingPrice?: string | null
  expiryDate?: string | null
  status: string
}

export default function StockPage() {
  const [items, setItems] = useState<StockItem[]>([])

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/stock')
      if (res.ok) {
        setItems(await res.json())
      }
    }
    load()
  }, [])

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Stock</h1>
            <p className="mt-2 text-gray-600">Manage inventory items, track expiry, and keep stock levels under control.</p>
          </div>
          <Link href="/stock/new" className="inline-flex items-center justify-center rounded bg-accent px-4 py-2 text-white hover:bg-accent/90">
            Add stock item
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          <div className="overflow-x-auto bg-white border rounded">
            <table className="min-w-full text-left">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3 text-sm font-semibold">Item</th>
                  <th className="p-3 text-sm font-semibold">Qty</th>
                  <th className="p-3 text-sm font-semibold">Reorder</th>
                  <th className="p-3 text-sm font-semibold">Cost</th>
                  <th className="p-3 text-sm font-semibold">Expiry</th>
                  <th className="p-3 text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td className="p-6 text-sm text-gray-500" colSpan={6}>No stock items yet.</td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-3 text-blue-600 hover:underline"><Link href={`/stock/${item.id}`}>{item.name}</Link></td>
                      <td className="p-3">{formatQuantity(item.currentQuantity, item.unit)}</td>
                      <td className="p-3">{formatQuantity(item.reorderAmount, item.unit)}</td>
                      <td className="p-3">{formatCurrency(Number(item.costPerUnit))}</td>
                      <td className="p-3">{item.expiryDate ? formatDate(new Date(item.expiryDate)) : '—'}</td>
                      <td className="p-3">{item.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
