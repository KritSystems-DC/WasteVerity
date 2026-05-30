import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { AppShell } from '@/components/AppShell'

const businessTypes = [
  'Takeaway', 'Café', 'Food Truck', 'Bakery', 'Restaurant', 'Barber', 'Salon', 'Tattoo Studio', 'Dog Groomer', 'Cleaning Company', 'Small Shop', 'Market Seller', 'Mobile Mechanic', 'Event Vendor', 'Other'
]
const currencies = ['GBP', 'USD', 'EUR']
const units = ['item', 'box', 'pack', 'bottle', 'litre', 'ml', 'kg', 'gram', 'tray', 'bag', 'roll', 'pair', 'case', 'crate', 'custom']

export default function Setup() {
  const [form, setForm] = useState({
    name: '',
    type: 'Takeaway',
    ownerName: '',
    email: '',
    phone: '',
    country: '',
    currency: 'GBP',
    timezone: 'Europe/London',
    defaultUnitPreference: 'item',
    lowStockAlertEnabled: true,
  })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/business/setup')
      if (res.ok) {
        const data = await res.json()
        setForm({
          name: data.name || '',
          type: data.type || 'Takeaway',
          ownerName: data.ownerName || '',
          email: data.email || '',
          phone: data.phone || '',
          country: data.country || '',
          currency: data.currency || 'GBP',
          timezone: data.timezone || 'Europe/London',
          defaultUnitPreference: data.defaultUnitPreference || 'item',
          lowStockAlertEnabled: data.lowStockAlertEnabled ?? true,
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage('')
    const res = await fetch('/api/business/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setMessage('Business setup saved successfully.')
    } else {
      const data = await res.json().catch(() => null)
      setMessage(data?.error || 'Unable to save business setup.')
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Business setup</h1>
          <p className="mt-2 text-gray-600">Complete your facility profile so WasteVerity can track inventory and kitchen controls accurately.</p>
        </div>

        {loading ? (
          <div className="bg-white border rounded p-6">Loading setup details…</div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4 max-w-3xl bg-white border rounded p-6">
            <label className="block">
              <span className="font-medium">Business name</span>
              <input
                className="w-full mt-1 p-2 border rounded"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label className="block">
              <span className="font-medium">Business type</span>
              <select
                className="w-full mt-1 p-2 border rounded"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {businessTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="font-medium">Owner name</span>
              <input
                className="w-full mt-1 p-2 border rounded"
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                required
              />
            </label>
            <label className="block">
              <span className="font-medium">Email</span>
              <input
                type="email"
                className="w-full mt-1 p-2 border rounded"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>
            <label className="block">
              <span className="font-medium">Phone number</span>
              <input
                className="w-full mt-1 p-2 border rounded"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="font-medium">Country</span>
              <input
                className="w-full mt-1 p-2 border rounded"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="font-medium">Currency</span>
                <select
                  className="w-full mt-1 p-2 border rounded"
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                >
                  {currencies.map((currency) => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="font-medium">Default unit</span>
                <select
                  className="w-full mt-1 p-2 border rounded"
                  value={form.defaultUnitPreference}
                  onChange={(e) => setForm({ ...form, defaultUnitPreference: e.target.value })}
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.lowStockAlertEnabled}
                onChange={(e) => setForm({ ...form, lowStockAlertEnabled: e.target.checked })}
                className="h-4 w-4"
              />
              <span className="text-sm text-gray-700">Enable low-inventory alerts</span>
            </label>
            <div className="flex items-center gap-3">
              <button type="submit" className="bg-accent text-white px-4 py-2 rounded">Save setup</button>
              {message && <p className="text-sm text-gray-700">{message}</p>}
            </div>
          </form>
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
  return { props: {} }
}
