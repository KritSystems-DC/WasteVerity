const features = [
  {
    title: 'Compliance logs',
    body: 'Capture HACCP checks, temperature records, corrective actions, and audit notes in a consistent workflow.',
  },
  {
    title: 'Waste intelligence',
    body: 'Track discarded food by item, quantity, cost, reason, and site so managers can spot avoidable loss quickly.',
  },
  {
    title: 'Inventory and expiry control',
    body: 'Monitor live stock levels, expiry exposure, reorder thresholds, and supplier-linked costs across the kitchen.',
  },
  {
    title: 'Staff requests',
    body: 'Let staff raise low-stock or missing-item requests while managers approve, reject, or add them to reorder lists.',
  },
  {
    title: 'Supplier oversight',
    body: 'Keep supplier contacts, ordering details, and item relationships in one place for faster purchasing decisions.',
  },
  {
    title: 'Management reporting',
    body: 'Export stock, waste, and reorder data for operational reviews, finance checks, and inspection preparation.',
  },
]

export default function Features() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">HealthServe features</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold">Healthcare food service workflows in one operating system.</h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-600">
          HealthServe connects compliance, waste, inventory, supplier, and staff workflows so regulated kitchens can work from one source of truth.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold">{feature.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
