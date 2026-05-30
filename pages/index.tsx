import HealthServeHeader from '@/components/HealthServeHeader'
import Link from 'next/link'
import { useMemo, useState } from 'react'

const gains = [
  { label: 'Target waste reduction', value: '15-20%' },
  { label: 'Audit prep time saved', value: '30-40 hrs/mo' },
  { label: 'Stock value protected', value: 'Live expiry risk' },
]

const costs = [
  {
    title: 'Food waste',
    body: 'Expired stock, overproduction, poor rotation, and unclear demand quietly remove margin every week.',
  },
  {
    title: 'Compliance admin',
    body: 'Paper HACCP logs, temperature sheets, and corrective actions take time to chase and are hard to evidence quickly.',
  },
  {
    title: 'Reactive ordering',
    body: 'Managers lose control when stock, expiry, suppliers, and staff requests sit in separate spreadsheets or notebooks.',
  },
]

const outcomes = [
  'Measure waste by item, reason, site, and estimated cost',
  'Keep HACCP, temperature, allergen, and incident evidence together',
  'See stock levels, expiry risk, supplier costs, and reorder needs earlier',
  'Give managers exportable reports for finance, operations, and inspection prep',
]

export default function Home() {
  const [mealsPerDay, setMealsPerDay] = useState(300)
  const [costPerMeal, setCostPerMeal] = useState(3.5)
  const [wasteRate, setWasteRate] = useState(12)

  const annualFoodSpend = useMemo(() => mealsPerDay * costPerMeal * 365, [mealsPerDay, costPerMeal])
  const annualWasteExposure = useMemo(() => annualFoodSpend * (wasteRate / 100), [annualFoodSpend, wasteRate])
  const conservativeSavings = useMemo(() => annualWasteExposure * 0.18, [annualWasteExposure])
  const monthlySavings = useMemo(() => conservativeSavings / 12, [conservativeSavings])

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <HealthServeHeader />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Healthcare food service savings portal</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
              Show the cost of waste, prove the compliance gain, then run the kitchen from one system.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              HealthServe combines the sales case and the operating app: prospects can estimate avoidable loss, understand the compliance workflow, and move straight into a managed pilot.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#savings" className="rounded bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800">
                Estimate savings
              </a>
              <Link href="/register" className="rounded border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-800 hover:bg-slate-100">
                Start pilot
              </Link>
            </div>
          </div>

          <div id="savings" className="rounded border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Savings calculator</h2>
                <p className="mt-2 text-sm text-blue-100">Use conservative assumptions to frame the business case.</p>
              </div>
              <span className="rounded bg-white/10 px-3 py-1 text-xs font-medium text-blue-100">Live estimate</span>
            </div>

            <div className="mt-6 grid gap-4">
              <label className="block">
                <span className="flex items-center justify-between text-sm font-medium text-blue-100">
                  Meals served per day <strong className="text-white">{mealsPerDay}</strong>
                </span>
                <input
                  type="range"
                  min="50"
                  max="1500"
                  step="25"
                  value={mealsPerDay}
                  onChange={(event) => setMealsPerDay(Number(event.target.value))}
                  className="mt-3 w-full"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-blue-100">Average food cost per meal</span>
                  <input
                    type="number"
                    min="1"
                    step="0.25"
                    value={costPerMeal}
                    onChange={(event) => setCostPerMeal(Number(event.target.value))}
                    className="mt-2 w-full rounded border border-white/20 bg-white/10 p-2 text-white"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-blue-100">Estimated waste rate (%)</span>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={wasteRate}
                    onChange={(event) => setWasteRate(Number(event.target.value))}
                    className="mt-2 w-full rounded border border-white/20 bg-white/10 p-2 text-white"
                  />
                </label>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded bg-white/10 p-4">
                <p className="text-sm text-blue-100">Annual waste exposure</p>
                <p className="mt-2 text-2xl font-bold">GBP {Math.round(annualWasteExposure).toLocaleString()}</p>
              </div>
              <div className="rounded bg-white/10 p-4">
                <p className="text-sm text-blue-100">Potential annual saving</p>
                <p className="mt-2 text-2xl font-bold">GBP {Math.round(conservativeSavings).toLocaleString()}</p>
              </div>
              <div className="rounded bg-white/10 p-4 sm:col-span-2">
                <p className="text-sm text-blue-100">Estimated monthly value unlocked</p>
                <p className="mt-2 text-3xl font-bold">GBP {Math.round(monthlySavings).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        {gains.map((item) => (
          <div key={item.label} className="rounded border border-slate-200 bg-white p-6">
            <p className="text-2xl font-bold text-blue-700">{item.value}</p>
            <p className="mt-2 text-sm text-slate-600">{item.label}</p>
          </div>
        ))}
      </section>

      <section id="waste" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Why teams buy</p>
          <h2 className="mt-3 text-3xl font-bold">The savings case is operational, not theoretical.</h2>
          <p className="mt-4 text-slate-600">
            HealthServe helps operators expose the avoidable cost, then gives the catering team the workflows needed to reduce it.
          </p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {costs.map((item) => (
            <article key={item.title} className="rounded border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="compliance" className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Compliance and control</p>
            <h2 className="mt-3 text-3xl font-bold">From sales portal to working software.</h2>
            <p className="mt-4 leading-7 text-slate-600">
              Prospects see the value on the public site. Once they start a pilot, the same product provides stock tracking, waste records, compliance templates, supplier oversight, staff requests, and reports.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {outcomes.map((item) => (
              <div key={item} className="rounded border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-800">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="inventory" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded border border-slate-200 bg-white p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Pilot conversion path</p>
              <h2 className="mt-3 text-3xl font-bold">Use the calculator to open the conversation, then onboard the facility into the app.</h2>
              <p className="mt-4 leading-7 text-slate-600">
                The portal is designed to support sales calls, outreach follow-ups, and facility reviews. It gives decision-makers a simple financial model before asking the kitchen team to change process.
              </p>
            </div>
            <div className="rounded bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Suggested pilot offer</p>
              <p className="mt-2 text-3xl font-bold">GBP 499/mo</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                One facility, configured templates, inventory setup, waste reason tracking, supplier records, and management review after 30 days.
              </p>
              <Link href="/register" className="mt-5 inline-flex rounded bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800">
                Start setup
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
