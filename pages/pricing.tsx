const plans = [
  {
    name: 'Pilot',
    price: 'GBP 499/mo',
    fit: 'Single-site care homes and small healthcare kitchens',
    features: ['Core inventory and waste tracking', 'HACCP-ready operational records', 'Email support', '30-day implementation review'],
  },
  {
    name: 'Professional',
    price: 'GBP 1,299/mo',
    fit: 'Most healthcare facilities and multi-team food service operations',
    features: ['Full compliance, stock, waste, and reorder workflows', 'Priority support', 'Management reports', 'Staff request approvals'],
  },
  {
    name: 'Network',
    price: 'Custom',
    fit: 'Groups, hospital networks, and regulated multi-site operators',
    features: ['Multi-site rollout planning', 'Custom reporting', 'Dedicated onboarding', 'Procurement and compliance review support'],
  },
]

export default function Pricing() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">HealthServe pricing</p>
        <h1 className="mt-3 text-4xl font-bold">Start with one facility, prove the savings, then scale.</h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-600">
          Pricing is structured around operational value: reduced waste, faster compliance preparation, and better stock control.
        </p>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.name} className="rounded border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-semibold">{plan.name}</h2>
              <p className="mt-2 text-3xl font-bold text-blue-700">{plan.price}</p>
              <p className="mt-3 min-h-12 text-sm text-slate-600">{plan.fit}</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                {plan.features.map((feature) => (
                  <li key={feature}>- {feature}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
