import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { AppShell } from '@/components/AppShell'

interface ReorderItem {
  id: string
  quantity: number
  unit: string
  status: string
  stockItem?: { name: string }
  supplier?: { name?: string }
}

interface ReorderList {
  id: string
  title: string
  status: string
  estimatedTotalCost: string
  createdAt: string
  items: ReorderItem[]
}

export default function Reorder() {
  const [lists, setLists] = useState<ReorderList[]>([])

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/reorder')
      if (res.ok) {
        setLists(await res.json())
      }
    }
    load()
  }, [])

  async function generate() {
    await fetch('/api/reorder/generate', { method: 'POST' })
    const res = await fetch('/api/reorder')
    if (res.ok) setLists(await res.json())
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Reorder</h1>
            <p className="mt-2 text-gray-600">Generate a reorder list from low-stock items and approved requests.</p>
          </div>
          <button onClick={generate} className="bg-accent text-white px-4 py-2 rounded">Generate reorder list</button>
        </div>

        <div className="overflow-x-auto bg-white border rounded">
          <table className="min-w-full text-left">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-sm font-semibold">Title</th>
                <th className="p-3 text-sm font-semibold">Status</th>
                <th className="p-3 text-sm font-semibold">Items</th>
                <th className="p-3 text-sm font-semibold">Created</th>
                <th className="p-3 text-sm font-semibold">Export</th>
              </tr>
            </thead>
            <tbody>
              {lists.length === 0 ? (
                <tr>
                  <td className="p-6 text-sm text-gray-500" colSpan={5}>No reorder lists yet.</td>
                </tr>
              ) : (
                lists.map((list) => (
                  <tr key={list.id} className="border-t">
                    <td className="p-3">{list.title}</td>
                    <td className="p-3">{list.status}</td>
                    <td className="p-3">{list.items.length}</td>
                    <td className="p-3">{new Date(list.createdAt).toLocaleDateString('en-GB')}</td>
                    <td className="p-3"><a className="text-blue-600 hover:underline" href={`/api/export/reorder/${list.id}`}>CSV</a></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
