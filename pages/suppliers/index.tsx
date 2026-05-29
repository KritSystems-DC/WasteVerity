import Link from 'next/link'
import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { AppShell } from '@/components/AppShell'

interface Supplier {
  id: string
  name: string
  contactName?: string | null
  email?: string | null
  phone?: string | null
}

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/suppliers')
      if (res.ok) {
        setSuppliers(await res.json())
      }
    }
    load()
  }, [])

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Suppliers</h1>
            <p className="mt-2 text-gray-600">Track supplier contacts and review pricing details.</p>
          </div>
          <Link href="/suppliers/new" className="inline-flex items-center justify-center rounded bg-accent px-4 py-2 text-white hover:bg-accent/90">
            Add supplier
          </Link>
        </div>

        <div className="overflow-x-auto bg-white border rounded">
          <table className="min-w-full text-left">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-sm font-semibold">Name</th>
                <th className="p-3 text-sm font-semibold">Contact</th>
                <th className="p-3 text-sm font-semibold">Email</th>
                <th className="p-3 text-sm font-semibold">Phone</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.length === 0 ? (
                <tr>
                  <td className="p-6 text-sm text-gray-500" colSpan={4}>No suppliers added yet.</td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr key={supplier.id} className="border-t">
                    <td className="p-3 text-blue-600 hover:underline"><Link href={`/suppliers/${supplier.id}`}>{supplier.name}</Link></td>
                    <td className="p-3">{supplier.contactName ?? '—'}</td>
                    <td className="p-3">{supplier.email ?? '—'}</td>
                    <td className="p-3">{supplier.phone ?? '—'}</td>
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
