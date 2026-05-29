import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { AppShell } from '@/components/AppShell'

type Note = { id: string; note: string; adminUserId: string; businessId?: string; userId?: string; createdAt: string }

export default function AdminNotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/notes')
    if (!res.ok) return
    const data = await res.json()
    setNotes(data.notes || [])
    setLoading(false)
  }

  async function createNote() {
    if (!text) return
    const res = await fetch('/api/admin/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ note: text }) })
    if (res.ok) {
      setText('')
      await load()
    }
  }

  async function del(id: string) {
    const res = await fetch('/api/admin/notes', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (res.ok) await load()
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Notes</h1>
          <p className="mt-2 text-gray-600">Internal notes for businesses and users.</p>
        </div>

        <div className="bg-white border rounded p-4">
          <textarea className="w-full border p-2" rows={3} value={text} onChange={(e) => setText(e.target.value)} />
          <div className="mt-2">
            <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={createNote}>Create Note</button>
          </div>
        </div>

        {loading ? (
          <div className="p-4 bg-white border rounded">Loading notes…</div>
        ) : (
          <div className="space-y-2">
            {notes.map((n) => (
              <div key={n.id} className="bg-white border rounded p-3 flex justify-between items-start">
                <div>
                  <div className="text-sm text-gray-500">By: {n.adminUserId} • {new Date(n.createdAt).toLocaleString()}</div>
                  <div className="mt-1">{n.note}</div>
                </div>
                <div>
                  <button className="text-red-600" onClick={() => del(n.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)
  if (!session) {
    return { redirect: { destination: '/login', permanent: false } }
  }
  if (session.user.role !== 'ADMIN') {
    return { redirect: { destination: '/dashboard', permanent: false } }
  }
  return { props: {} }
}
