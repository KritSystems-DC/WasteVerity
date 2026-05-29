import { useState } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { AppShell } from '@/components/AppShell'

export default function NewSupplier() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', contactName: '', email: '', phone: '', website: '', address: '', notes: '' })
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const res = await fetch('/api/suppliers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      router.push('/suppliers')
    } else {
      const data = await res.json().catch(() => null)
      setMessage(data?.error || 'Unable to add supplier.')
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Add supplier</h1>
          <p className="mt-2 text-gray-600">Add a supplier contact so you can track purchase costs and reorder sources.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 max-w-3xl bg-white border rounded p-6">
          <label className="block">
            <span className="font-medium">Supplier name</span>
            <input className="w-full mt-1 p-2 border rounded" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label className="block">
            <span className="font-medium">Contact name</span>
            <input className="w-full mt-1 p-2 border rounded" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
          </label>
          <label className="block">
            <span className="font-medium">Email</span>
            <input type="email" className="w-full mt-1 p-2 border rounded" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label className="block">
            <span className="font-medium">Phone</span>
            <input className="w-full mt-1 p-2 border rounded" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <label className="block">
            <span className="font-medium">Website</span>
            <input className="w-full mt-1 p-2 border rounded" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </label>
          <label className="block">
            <span className="font-medium">Address</span>
            <input className="w-full mt-1 p-2 border rounded" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </label>
          <label className="block">
            <span className="font-medium">Notes</span>
            <textarea className="w-full mt-1 p-2 border rounded" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={4} />
          </label>
          <div className="flex items-center gap-3">
            <button type="submit" className="bg-accent text-white px-4 py-2 rounded">Save supplier</button>
            {message && <p className="text-sm text-gray-700">{message}</p>}
          </div>
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
