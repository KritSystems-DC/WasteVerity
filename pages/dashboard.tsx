import { useEffect, useState } from 'react'
import { getSession, useSession } from 'next-auth/react'
import { GetServerSideProps } from 'next'
import { AppShell } from '@/components/AppShell'
import { formatCurrency, isExpiringSoon, isExpired } from '@/lib/utils'

interface StockItem {
  id: string
  name: string
  currentQuantity: number
  minimumQuantity: number
  costPerUnit: string
  expiryDate?: string | null
}

export default function Dashboard() {
  const { data: session } = useSession()
  const [items, setItems] = useState<StockItem[]>([])
  const [requests, setRequests] = useState<number>(0)

  useEffect(() => {
    async function load() {
      const [stocksRes, requestsRes] = await Promise.all([
        fetch('/api/stock'),
        fetch('/api/staff-requests')
      ])
      if (stocksRes.ok) {
        const stocks = await stocksRes.json()
        setItems(stocks)
      }
      if (requestsRes.ok) {
        const staffRequests = await requestsRes.json()
        setRequests(staffRequests.length)
      }
    }
    load()
  }, [])

  const lowStockCount = items.filter((item) => item.currentQuantity <= item.minimumQuantity).length
  const expiringSoonCount = items.filter((item) => item.expiryDate && isExpiringSoon(new Date(item.expiryDate), 7)).length
  const stockValue = items.reduce((sum, item) => sum + Number(item.costPerUnit || 0) * item.currentQuantity, 0)

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-2 text-gray-600">{session?.user?.name ? `Welcome back, ${session.user.name}` : 'Manage your stock and alerts in one place.'}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="p-4 border rounded bg-white">
            <p className="text-sm text-gray-500">Active stock items</p>
            <p className="mt-2 text-3xl font-semibold">{items.length}</p>
          </div>
          <div className="p-4 border rounded bg-white">
            <p className="text-sm text-gray-500">Low stock items</p>
            <p className="mt-2 text-3xl font-semibold">{lowStockCount}</p>
          </div>
          <div className="p-4 border rounded bg-white">
            <p className="text-sm text-gray-500">Expiring soon</p>
            <p className="mt-2 text-3xl font-semibold">{expiringSoonCount}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-4 border rounded bg-white">
            <p className="text-sm text-gray-500">Estimated stock value</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(stockValue)}</p>
          </div>
          <div className="p-4 border rounded bg-white">
            <p className="text-sm text-gray-500">Pending staff requests</p>
            <p className="mt-2 text-2xl font-semibold">{requests}</p>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)
  if (!session?.user?.businessId) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    }
  }
  return { props: {} }
}
