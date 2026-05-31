import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { AppShell } from '@/components/AppShell'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate, formatQuantity } from '@/lib/utils'

interface ReportStockItem {
  id: string
  name: string
  currentQuantity: number
  minimumQuantity: number
  reorderAmount: number
  unit: string
  costPerUnit: string
  expiryDate: string | null
  supplierName: string | null
}

interface WasteSummaryItem {
  stockItemId: string
  name: string
  unit: string
  quantity: number
  estimatedLoss: number
}

interface ReportsProps {
  stockCount: number
  lowStockItems: ReportStockItem[]
  expiredItems: ReportStockItem[]
  expiringSoonItems: ReportStockItem[]
  totalWasteRecords: number
  totalWasteLoss: number
  wasteLoss30Days: number
  topWasteItems: WasteSummaryItem[]
}

export default function Reports({
  stockCount,
  lowStockItems,
  expiredItems,
  expiringSoonItems,
  totalWasteRecords,
  totalWasteLoss,
  wasteLoss30Days,
  topWasteItems,
}: ReportsProps) {
  const expiryRiskCount = expiredItems.length + expiringSoonItems.length

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="mt-2 text-gray-600">Review stock risk, expiry exposure and waste loss before exporting data.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded border bg-white p-4">
            <p className="text-sm text-gray-500">Active stock items</p>
            <p className="mt-2 text-3xl font-semibold">{stockCount}</p>
          </div>
          <div className="rounded border bg-white p-4">
            <p className="text-sm text-gray-500">Low stock items</p>
            <p className="mt-2 text-3xl font-semibold">{lowStockItems.length}</p>
          </div>
          <div className="rounded border bg-white p-4">
            <p className="text-sm text-gray-500">Expiry risk</p>
            <p className="mt-2 text-3xl font-semibold">{expiryRiskCount}</p>
          </div>
          <div className="rounded border bg-white p-4">
            <p className="text-sm text-gray-500">Waste loss</p>
            <p className="mt-2 text-3xl font-semibold">{formatCurrency(totalWasteLoss)}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-white border rounded p-6 space-y-3">
            <h2 className="text-lg font-semibold">Stock CSV</h2>
            <p className="text-sm text-gray-600">Download all stock items with quantities, costs, expiry dates and reorder settings.</p>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/api/export/stock" className="inline-flex rounded bg-accent px-4 py-2 text-white">Download stock CSV</a>
          </div>
          <div className="bg-white border rounded p-6 space-y-3">
            <h2 className="text-lg font-semibold">Waste CSV</h2>
            <p className="text-sm text-gray-600">Download waste records with item, quantity, reason and estimated cost lost.</p>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/api/export/waste" className="inline-flex rounded bg-accent px-4 py-2 text-white">Download waste CSV</a>
          </div>
        </div>

        <section className="rounded border bg-white">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Low Stock Summary</h2>
            <p className="mt-1 text-sm text-gray-600">Items at or below their minimum quantity, ordered by the biggest shortfall.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3 text-sm font-semibold">Item</th>
                  <th className="p-3 text-sm font-semibold">Current</th>
                  <th className="p-3 text-sm font-semibold">Minimum</th>
                  <th className="p-3 text-sm font-semibold">Suggested reorder</th>
                  <th className="p-3 text-sm font-semibold">Supplier</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.length === 0 ? (
                  <tr>
                    <td className="p-6 text-sm text-gray-500" colSpan={5}>No low stock items right now.</td>
                  </tr>
                ) : (
                  lowStockItems.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-3 font-medium">{item.name}</td>
                      <td className="p-3">{formatQuantity(item.currentQuantity, item.unit)}</td>
                      <td className="p-3">{formatQuantity(item.minimumQuantity, item.unit)}</td>
                      <td className="p-3">{formatQuantity(item.reorderAmount, item.unit)}</td>
                      <td className="p-3">{item.supplierName || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded border bg-white">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Expiry Summary</h2>
            <p className="mt-1 text-sm text-gray-600">Expired stock and items expiring in the next 14 days.</p>
          </div>
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            <div className="rounded border border-red-100 bg-red-50 p-4">
              <p className="text-sm text-red-700">Expired</p>
              <p className="mt-2 text-2xl font-semibold text-red-900">{expiredItems.length}</p>
            </div>
            <div className="rounded border border-amber-100 bg-amber-50 p-4">
              <p className="text-sm text-amber-700">Expiring in 14 days</p>
              <p className="mt-2 text-2xl font-semibold text-amber-900">{expiringSoonItems.length}</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3 text-sm font-semibold">Item</th>
                  <th className="p-3 text-sm font-semibold">Quantity</th>
                  <th className="p-3 text-sm font-semibold">Expiry date</th>
                  <th className="p-3 text-sm font-semibold">Status</th>
                  <th className="p-3 text-sm font-semibold">Stock value at risk</th>
                </tr>
              </thead>
              <tbody>
                {expiryRiskCount === 0 ? (
                  <tr>
                    <td className="p-6 text-sm text-gray-500" colSpan={5}>No expired or soon-to-expire stock found.</td>
                  </tr>
                ) : (
                  [...expiredItems, ...expiringSoonItems].map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-3 font-medium">{item.name}</td>
                      <td className="p-3">{formatQuantity(item.currentQuantity, item.unit)}</td>
                      <td className="p-3">{formatDate(item.expiryDate)}</td>
                      <td className="p-3">{expiredItems.some((expired) => expired.id === item.id) ? 'Expired' : 'Soon'}</td>
                      <td className="p-3">{formatCurrency(Number(item.costPerUnit) * item.currentQuantity)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded border bg-white">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Waste Summary</h2>
            <p className="mt-1 text-sm text-gray-600">Cost lost through recorded waste, with highest-loss items first.</p>
          </div>
          <div className="grid gap-4 p-4 sm:grid-cols-3">
            <div className="rounded border bg-white p-4">
              <p className="text-sm text-gray-500">Waste records</p>
              <p className="mt-2 text-2xl font-semibold">{totalWasteRecords}</p>
            </div>
            <div className="rounded border bg-white p-4">
              <p className="text-sm text-gray-500">Total loss</p>
              <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalWasteLoss)}</p>
            </div>
            <div className="rounded border bg-white p-4">
              <p className="text-sm text-gray-500">Loss in 30 days</p>
              <p className="mt-2 text-2xl font-semibold">{formatCurrency(wasteLoss30Days)}</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3 text-sm font-semibold">Item</th>
                  <th className="p-3 text-sm font-semibold">Quantity wasted</th>
                  <th className="p-3 text-sm font-semibold">Estimated loss</th>
                </tr>
              </thead>
              <tbody>
                {topWasteItems.length === 0 ? (
                  <tr>
                    <td className="p-6 text-sm text-gray-500" colSpan={3}>No waste recorded yet.</td>
                  </tr>
                ) : (
                  topWasteItems.map((item) => (
                    <tr key={item.stockItemId} className="border-t">
                      <td className="p-3 font-medium">{item.name}</td>
                      <td className="p-3">{formatQuantity(item.quantity, item.unit)}</td>
                      <td className="p-3">{formatCurrency(item.estimatedLoss)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)
  const businessId = session?.user?.businessId
  if (!businessId) {
    return { redirect: { destination: '/login', permanent: false } }
  }

  const now = new Date()
  const in14Days = new Date(now)
  in14Days.setDate(in14Days.getDate() + 14)
  const since30Days = new Date(now)
  since30Days.setDate(since30Days.getDate() - 30)

  const [stockItems, wasteRecords] = await Promise.all([
    prisma.stockItem.findMany({
      where: { businessId, status: 'ACTIVE' },
      include: { supplier: { select: { name: true } } },
      orderBy: { name: 'asc' },
    }),
    prisma.wasteRecord.findMany({
      where: { businessId },
      include: { stockItem: { select: { id: true, name: true, unit: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const reportItems: ReportStockItem[] = stockItems.map((item) => ({
    id: item.id,
    name: item.name,
    currentQuantity: item.currentQuantity,
    minimumQuantity: item.minimumQuantity,
    reorderAmount: item.reorderAmount,
    unit: item.unit,
    costPerUnit: item.costPerUnit.toString(),
    expiryDate: item.expiryDate ? item.expiryDate.toISOString() : null,
    supplierName: item.supplier?.name || null,
  }))

  const lowStockItems = reportItems
    .filter((item) => item.currentQuantity <= item.minimumQuantity)
    .sort((a, b) => (b.minimumQuantity - b.currentQuantity) - (a.minimumQuantity - a.currentQuantity))
    .slice(0, 8)

  const expiredItems = reportItems
    .filter((item) => item.expiryDate && new Date(item.expiryDate) < now)
    .sort((a, b) => new Date(a.expiryDate || '').getTime() - new Date(b.expiryDate || '').getTime())
    .slice(0, 8)

  const expiringSoonItems = reportItems
    .filter((item) => {
      if (!item.expiryDate) return false
      const expiryDate = new Date(item.expiryDate)
      return expiryDate >= now && expiryDate <= in14Days
    })
    .sort((a, b) => new Date(a.expiryDate || '').getTime() - new Date(b.expiryDate || '').getTime())
    .slice(0, 8)

  const totalWasteLoss = wasteRecords.reduce((sum, record) => sum + Number(record.estimatedCostLost), 0)
  const wasteLoss30Days = wasteRecords
    .filter((record) => record.createdAt >= since30Days)
    .reduce((sum, record) => sum + Number(record.estimatedCostLost), 0)

  const wasteByItem = new Map<string, WasteSummaryItem>()
  for (const record of wasteRecords) {
    const existing = wasteByItem.get(record.stockItemId)
    if (existing) {
      existing.quantity += record.quantity
      existing.estimatedLoss += Number(record.estimatedCostLost)
    } else {
      wasteByItem.set(record.stockItemId, {
        stockItemId: record.stockItemId,
        name: record.stockItem.name,
        unit: record.stockItem.unit,
        quantity: record.quantity,
        estimatedLoss: Number(record.estimatedCostLost),
      })
    }
  }

  return {
    props: {
      stockCount: reportItems.length,
      lowStockItems,
      expiredItems,
      expiringSoonItems,
      totalWasteRecords: wasteRecords.length,
      totalWasteLoss,
      wasteLoss30Days,
      topWasteItems: Array.from(wasteByItem.values())
        .sort((a, b) => b.estimatedLoss - a.estimatedLoss)
        .slice(0, 8),
    },
  }
}
