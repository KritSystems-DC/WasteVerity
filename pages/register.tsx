import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Register() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  async function handleSubmit(e: any) {
    e.preventDefault()
    // For MVP: create user via API route placeholder
    await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) })
    router.push('/login')
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="max-w-md w-full border rounded p-6">
        <h1 className="text-xl font-bold mb-4">Register</h1>
        <label className="block mb-2">Name</label>
        <input className="w-full p-2 border rounded mb-4" value={name} onChange={(e) => setName(e.target.value)} />
        <label className="block mb-2">Email</label>
        <input className="w-full p-2 border rounded mb-4" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="block mb-2">Password</label>
        <input type="password" className="w-full p-2 border rounded mb-4" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="bg-accent text-white px-4 py-2 rounded">Create account</button>
      </form>
    </main>
  )
}
