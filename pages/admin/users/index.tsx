import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { AppShell } from '@/components/AppShell'

type User = { id: string; name: string; email: string; role: string; businessId?: string }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    if (!res.ok) return setError('Unable to load users')
    const data = await res.json()
    setUsers(data.users || [])
    setLoading(false)
  }

  async function saveRole(id: string, role: string) {
    const res = await fetch('/api/admin/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, role }) })
    if (!res.ok) return setError('Failed to update user')
    await load()
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="mt-2 text-gray-600">List and manage platform users and roles.</p>
        </div>

        {error && <div className="text-red-600">{error}</div>}

        {loading ? (
          <div className="p-4 bg-white border rounded">Loading users…</div>
        ) : (
          <div className="bg-white border rounded">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="text-left">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Business</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="px-4 py-2">{u.name}</td>
                    <td className="px-4 py-2">{u.email}</td>
                    <td className="px-4 py-2">
                      <select defaultValue={u.role} onChange={(e) => saveRole(u.id, e.target.value)} className="border p-1">
                        <option value="OWNER">OWNER</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="STAFF">STAFF</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">{u.businessId || '-'}</td>
                    <td className="px-4 py-2">&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
