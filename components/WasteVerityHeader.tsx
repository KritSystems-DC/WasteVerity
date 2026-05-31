import Link from 'next/link'

const nav = [
  { label: 'Compliance', href: '#compliance' },
  { label: 'Waste', href: '#waste' },
  { label: 'Inventory', href: '#inventory' },
  { label: 'Pricing', href: '/wasteverity#pricing' },
]

export default function WasteVerityHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-700">
            <span className="text-lg font-bold text-white">W</span>
          </div>
          <span className="text-lg font-bold text-slate-950">WasteVerity</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-blue-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-blue-700">
            App login
          </Link>
          <Link href="/wasteverity#demo" className="rounded bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
            Book demo
          </Link>
        </div>
      </div>
    </header>
  )
}
