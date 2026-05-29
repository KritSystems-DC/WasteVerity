import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Register() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('Other')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: any) {
    e.preventDefault()
    setMessage('')
    setErrors([])
    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, businessName, businessType }),
    })
    const data = await res.json().catch(() => null)
    setLoading(false)
    if (!res.ok) {
      setErrors(data?.errors || [data?.error || 'Unable to create account.'])
      return
    }
    setMessage('Account created. Redirecting to login...')
    router.push('/login')
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="max-w-md w-full border rounded p-6 bg-white">
        <h1 className="text-xl font-bold mb-4">Register</h1>
        <label className="block mb-2">Name</label>
        <input className="w-full p-2 border rounded mb-4" value={name} onChange={(e) => setName(e.target.value)} required />
        <label className="block mb-2">Email</label>
        <input type="email" className="w-full p-2 border rounded mb-4" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label className="block mb-2">Business name</label>
        <input className="w-full p-2 border rounded mb-4" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
        <label className="block mb-2">Business type</label>
        <input className="w-full p-2 border rounded mb-4" value={businessType} onChange={(e) => setBusinessType(e.target.value)} required />
        <label className="block mb-2">Password</label>
        <input type="password" className="w-full p-2 border rounded mb-4" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <p className="mb-4 text-xs text-gray-500">Use at least 8 characters with uppercase, lowercase and a number.</p>
        <button disabled={loading} className="bg-accent text-white px-4 py-2 rounded disabled:opacity-60">{loading ? 'Creating...' : 'Create account'}</button>
        {message && <p className="mt-4 text-sm text-green-700">{message}</p>}
        {errors.length > 0 && (
          <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <ul className="list-disc pl-5">
              {errors.map((error) => <li key={error}>{error}</li>)}
            </ul>
          </div>
        )}
      </form>
    </main>
  )
}
