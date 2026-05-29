import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { AppShell } from '@/components/AppShell'

export default function SupplierDetail() {
  const router = useRouter()
  const { id } = router.query
  const [supplier, setSupplier] = useState<any>(null)
  const [form, setForm] = useState<any>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!id || typeof id !== 'string') return
    fetch(`/api/suppliers/${id}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        setSupplier(data)
        setForm(data)
      })
  }, [id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!id || typeof id !== 'string') return
    const data = new FormData(e.currentTarget)
    const payload = {
      name: String(data.get('name') || ''),
      contactName: String(data.get('contactName') || ''),
      email: String(data.get('email') || ''),
      phone: String(data.get('phone') || ''),
      website: String(data.get('website') || ''),
      address: String(data.get('address') || ''),
      notes: String(data.get('notes') || ''),
    }
    const res = await fetch(`/api/suppliers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      const updated = await res.json()
      setSupplier(updated)
      setForm(updated)
      setMessage('Supplier saved.')
    } else {
      const data = await res.json().catch(() => null)
      setMessage(data?.error || 'Unable to save supplier.')
    }
  }

  async function deleteSupplier() {
    if (!id || typeof id !== 'string') return
    if (!confirm('Delete this supplier? Stock items linked to it will keep their stock record.')) return
    const res = await fetch(`/api/suppliers/${id}`, { method: 'DELETE' })
    if (res.ok) router.push('/suppliers')
    else setMessage('Unable to delete supplier.')
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Supplier details</h1>
          <p className="mt-2 text-gray-600">Review and update supplier contact details and order notes.</p>
        </div>

        {!supplier ? (
          <div className="bg-white border rounded p-6">Loading supplier...</div>
        ) : (
          <div className="space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white border rounded p-4">
              <div>
                <h2 className="text-lg font-semibold">{supplier.name}</h2>
                <p className="text-sm text-gray-500">{supplier.contactName || 'Supplier details'}</p>
              </div>
              <Link href="/suppliers" className="rounded border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50">Back to suppliers</Link>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 bg-white border rounded p-6">
              <label className="block">
                <span className="font-medium">Name</span>
                <input name="name" className="w-full mt-1 p-2 border rounded" value={form?.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </label>
              <label className="block">
                <span className="font-medium">Contact</span>
                <input name="contactName" className="w-full mt-1 p-2 border rounded" value={form?.contactName || ''} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="font-medium">Email</span>
                  <input name="email" type="email" className="w-full mt-1 p-2 border rounded" value={form?.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </label>
                <label className="block">
                  <span className="font-medium">Phone</span>
                  <input name="phone" className="w-full mt-1 p-2 border rounded" value={form?.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </label>
              </div>
              <label className="block">
                <span className="font-medium">Website</span>
                <input name="website" className="w-full mt-1 p-2 border rounded" value={form?.website || ''} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              </label>
              <label className="block">
                <span className="font-medium">Address</span>
                <input name="address" className="w-full mt-1 p-2 border rounded" value={form?.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </label>
              <label className="block">
                <span className="font-medium">Notes</span>
                <textarea name="notes" className="w-full mt-1 p-2 border rounded" value={form?.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={4} />
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className="rounded bg-accent px-4 py-2 text-white">Save supplier</button>
                <button type="button" onClick={deleteSupplier} className="rounded border border-red-200 px-4 py-2 text-red-700 hover:bg-red-50">Delete</button>
                {message && <p className="text-sm text-gray-700">{message}</p>}
              </div>
            </form>
          </div>
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
