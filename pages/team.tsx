import { FormEvent, useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { AppShell } from '@/components/AppShell'

interface TeamUser {
  id: string
  name: string
  email: string
  role: string
}

export default function Team() {
  const [users, setUsers] = useState<TeamUser[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STAFF' })

  async function loadUsers() {
    const res = await fetch('/api/team')
    if (!res.ok) {
      setError('Unable to load team users.')
      return
    }
    setUsers(await res.json())
  }

  useEffect(() => {
    loadUsers()
  }, [])

  async function createUser(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    setError('')
    const res = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || data.errors?.join(' ') || 'Unable to create team user.')
      return
    }
    setForm({ name: '', email: '', password: '', role: 'STAFF' })
    setMessage('Team user created.')
    await loadUsers()
  }

  async function updateRole(id: string, role: string) {
    setMessage('')
    setError('')
    const res = await fetch(`/api/team/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Unable to update role.')
      return
    }
    setMessage('Team role updated.')
    await loadUsers()
  }

  async function removeUser(id: string) {
    setMessage('')
    setError('')
    const res = await fetch(`/api/team/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Unable to remove user.')
      return
    }
    setMessage('Team user removed.')
    await loadUsers()
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="mt-2 text-gray-600">Manage owner and staff access for this business.</p>
        </div>

        {message && <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>}
        {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={createUser} className="grid gap-4 bg-white border rounded p-6 md:grid-cols-5">
          <input className="border rounded px-3 py-2" placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <input className="border rounded px-3 py-2" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <input className="border rounded px-3 py-2" placeholder="Temporary password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          <select className="border rounded px-3 py-2" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
            <option value="STAFF">Staff</option>
            <option value="OWNER">Owner</option>
          </select>
          <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Create user</button>
        </form>

        <div className="overflow-x-auto bg-white border rounded">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((teamUser) => (
                <tr key={teamUser.id}>
                  <td className="px-4 py-3 text-sm text-gray-700">{teamUser.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{teamUser.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <select className="border rounded px-2 py-1" value={teamUser.role} onChange={(event) => updateRole(teamUser.id, event.target.value)}>
                      <option value="STAFF">STAFF</option>
                      <option value="OWNER">OWNER</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <button className="text-red-600 hover:underline" onClick={() => removeUser(teamUser.id)}>Remove</button>
                  </td>
                </tr>
              ))}
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
  if (session.user.role !== 'OWNER') {
    return { redirect: { destination: '/dashboard', permanent: false } }
  }
  return { props: {} }
}
