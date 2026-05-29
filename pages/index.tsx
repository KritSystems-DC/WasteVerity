import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">StockSense</h1>
          <p className="text-gray-600">Stop running out. Stop overbuying. Know what your stock is costing you.</p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/pricing" className="p-4 border rounded hover:shadow">Pricing</Link>
          <Link href="/features" className="p-4 border rounded hover:shadow">Features</Link>
          <Link href="/login" className="p-4 border rounded hover:shadow">Login</Link>
          <Link href="/register" className="p-4 border rounded hover:shadow">Register</Link>
        </div>
      </div>
    </main>
  )
}
