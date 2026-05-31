import WasteVerityHeader from '@/components/WasteVerityHeader'
import Link from 'next/link'
import { useMemo, useState } from 'react'

const modules = [
  {
    id: 'compliance',
    title: 'Compliance operations',
    body: 'Digitise HACCP checks, temperature logs, corrective actions, and audit evidence so teams are inspection-ready without chasing paper.',
  },
  {
    id: 'waste',
    title: 'Waste reduction',
    body: 'Record what was discarded, why it happened, and what it cost. Turn waste records into manager actions and measurable savings.',
  },
  {
    id: 'inventory',
    title: 'Inventory control',
    body: 'Track stock levels, expiry dates, reorder thresholds, suppliers, and price changes across the healthcare kitchen.',
  },
]

const proof = [
  { value: '15-20%', label: 'target food waste reduction' },
  { value: 'GBP 20k-30k+', label: 'annual savings opportunity per facility' },
  { value: '5 hrs/mo', label: 'target compliance admin after rollout' },
]

const features = [
  'HACCP-ready compliance records',
  'Temperature and corrective-action logs',
  'Waste cost dashboard',
  'Inventory and expiry tracking',
  'Supplier records and reorder lists',
  'Staff request approvals',
  'CSV exports for management review',
  'Admin controls for multi-user teams',
]

export default function WasteVerityLanding() {
  const [residents, setResidents] = useState(100)
  const annualWaste = residents * 45 * 52
  const annualSavings = useMemo(() => Math.round(annualWaste * 0.18), [annualWaste])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <WasteVerityHeader />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">WasteVerity for healthcare food service</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
              Reduce kitchen waste, simplify compliance, and keep every facility audit-ready.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              This website handles the sales conversation. The WasteVerity app is the operational tool care homes,
              hospitals, and regulated food service teams use to manage stock, HACCP records, waste, suppliers,
              staff requests, and reporting.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#demo" className="rounded bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800">
                Book a demo
              </a>
              <a href="#pricing" className="rounded border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 hover:bg-slate-100">
                View pilot pricing
              </a>
            </div>
          </div>

          <div className="rounded border border-slate-200 bg-slate-900 p-6 text-white">
            <h2 className="text-xl font-semibold">Savings calculator</h2>
            <label className="mt-6 block text-sm font-medium text-blue-100">Residents or patients served</label>
            <input
              type="range"
              min="20"
              max="500"
              value={residents}
              onChange={(event) => setResidents(Number(event.target.value))}
              className="mt-4 w-full"
            />
            <div className="mt-3 text-3xl font-bold">{residents}</div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded bg-white/10 p-4">
                <p className="text-sm text-blue-100">Estimated annual waste exposure</p>
                <p className="mt-2 text-2xl font-bold">GBP {annualWaste.toLocaleString()}</p>
              </div>
              <div className="rounded bg-white/10 p-4">
                <p className="text-sm text-blue-100">Potential annual savings</p>
                <p className="mt-2 text-2xl font-bold">GBP {annualSavings.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        {proof.map((item) => (
          <div key={item.label} className="rounded border border-slate-200 bg-white p-6">
            <p className="text-3xl font-bold text-blue-700">{item.value}</p>
            <p className="mt-2 text-sm text-slate-600">{item.label}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-3">
          {modules.map((module) => (
            <article key={module.id} id={module.id} className="rounded border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-semibold">{module.title}</h2>
              <p className="mt-3 leading-7 text-slate-600">{module.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Platform coverage</p>
            <h2 className="mt-3 text-3xl font-bold">Built around the daily work of regulated kitchens.</h2>
            <p className="mt-4 text-slate-600">
              WasteVerity is designed for the recurring routines that decide whether a kitchen is compliant,
              cost-controlled, and ready for inspection.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature} className="rounded border border-slate-200 bg-slate-50 p-4 text-sm font-medium">
                {feature}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded border border-slate-200 bg-white p-8">
          <h2 className="text-3xl font-bold">Pilot offer</h2>
          <p className="mt-4 max-w-3xl text-slate-600">
            Start with one facility for 30 days. WasteVerity helps configure inventory categories, waste reasons,
            compliance tasks, users, and reports, then reviews the operational impact at the end of the pilot.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-slate-500">Pilot plan</p>
              <p className="mt-1 text-2xl font-bold">GBP 499/mo</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Professional plan</p>
              <p className="mt-1 text-2xl font-bold">GBP 1,299/mo</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Network plan</p>
              <p className="mt-1 text-2xl font-bold">Custom</p>
            </div>
          </div>
        </div>
      </section>

      <section id="demo" className="bg-blue-700 text-white">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold">Ready to review one facility?</h2>
          <p className="mt-4 text-blue-100">
            Book a 20-minute walkthrough focused on your current compliance process, waste records, and stock workflow.
          </p>
          <Link href="/wasteverity#demo" className="mt-8 inline-flex rounded bg-white px-6 py-3 font-semibold text-blue-700 hover:bg-blue-50">
            Book a demo
          </Link>
        </div>
      </section>
    </div>
  )
}
