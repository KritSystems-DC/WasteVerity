import { useMemo, useState } from 'react'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { AppShell } from '@/components/AppShell'
import {
  ComplianceTemplate,
  ComplianceTemplateCategory,
  complianceTemplates,
  templateToCsv,
} from '@/lib/complianceTemplates'

const categories: Array<ComplianceTemplateCategory | 'All'> = [
  'All',
  'Food safety',
  'Allergens',
  'Stock control',
  'Waste',
  'Suppliers',
  'People',
  'Governance',
]

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function downloadTemplateCsv(template: ComplianceTemplate) {
  downloadFile(`${slugify(template.title)}.csv`, templateToCsv(template), 'text/csv;charset=utf-8')
}

function downloadTemplateJson(template: ComplianceTemplate) {
  downloadFile(
    `${slugify(template.title)}.json`,
    JSON.stringify(template, null, 2),
    'application/json;charset=utf-8'
  )
}

export default function Compliance() {
  const [category, setCategory] = useState<ComplianceTemplateCategory | 'All'>('All')
  const [selectedId, setSelectedId] = useState(complianceTemplates[0].id)
  const [query, setQuery] = useState('')

  const filteredTemplates = useMemo(() => {
    const normalisedQuery = query.trim().toLowerCase()
    return complianceTemplates.filter((template) => {
      const matchesCategory = category === 'All' || template.category === category
      const matchesQuery =
        !normalisedQuery ||
        template.title.toLowerCase().includes(normalisedQuery) ||
        template.purpose.toLowerCase().includes(normalisedQuery) ||
        template.fields.some((field) => field.label.toLowerCase().includes(normalisedQuery))
      return matchesCategory && matchesQuery
    })
  }, [category, query])

  const selectedTemplate =
    filteredTemplates.find((template) => template.id === selectedId) ||
    filteredTemplates[0] ||
    complianceTemplates[0]

  const totalFields = complianceTemplates.reduce((sum, template) => sum + template.fields.length, 0)
  const requiredFields = selectedTemplate.fields.filter((field) => field.required).length

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Compliance templates</h1>
            <p className="mt-2 max-w-3xl text-gray-600">
              Client-ready records for healthcare kitchens covering HACCP routines, allergens, stock risk, suppliers, incidents, training, and audit evidence.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => downloadTemplateCsv(selectedTemplate)}
              className="rounded bg-accent px-4 py-2 text-sm font-medium text-white"
            >
              Export CSV
            </button>
            <button
              onClick={() => downloadTemplateJson(selectedTemplate)}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800"
            >
              Export JSON
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded border bg-white p-4">
            <p className="text-sm text-gray-500">Templates</p>
            <p className="mt-2 text-3xl font-semibold">{complianceTemplates.length}</p>
          </div>
          <div className="rounded border bg-white p-4">
            <p className="text-sm text-gray-500">Template fields</p>
            <p className="mt-2 text-3xl font-semibold">{totalFields}</p>
          </div>
          <div className="rounded border bg-white p-4">
            <p className="text-sm text-gray-500">Current required fields</p>
            <p className="mt-2 text-3xl font-semibold">{requiredFields}</p>
          </div>
        </div>

        <section className="rounded border bg-white p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Search templates</span>
              <input
                className="mt-1 w-full rounded border p-2"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Allergen, delivery, incident..."
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Category</span>
              <select
                className="mt-1 w-full rounded border p-2"
                value={category}
                onChange={(event) => setCategory(event.target.value as ComplianceTemplateCategory | 'All')}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <section className="space-y-3">
            {filteredTemplates.length === 0 ? (
              <div className="rounded border bg-white p-6 text-sm text-gray-500">No templates match this filter.</div>
            ) : (
              filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedId(template.id)}
                  className={`w-full rounded border bg-white p-4 text-left transition ${
                    selectedTemplate.id === template.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-950">{template.title}</p>
                      <p className="mt-1 text-sm text-gray-600">{template.category}</p>
                    </div>
                    <span className="rounded bg-slate-100 px-2 py-1 text-xs text-gray-700">{template.fields.length} fields</span>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">{template.cadence}</p>
                </button>
              ))
            )}
          </section>

          <section className="rounded border bg-white">
            <div className="border-b p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">{selectedTemplate.category}</p>
                  <h2 className="mt-1 text-xl font-semibold text-gray-950">{selectedTemplate.title}</h2>
                  <p className="mt-2 max-w-3xl text-gray-600">{selectedTemplate.purpose}</p>
                </div>
                <div className="rounded bg-slate-50 p-3 text-sm text-gray-700 lg:w-72">
                  <p><span className="font-medium">Owner:</span> {selectedTemplate.owner}</p>
                  <p className="mt-1"><span className="font-medium">Cadence:</span> {selectedTemplate.cadence}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-[1fr_280px]">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="p-3 text-sm font-semibold">Field</th>
                      <th className="p-3 text-sm font-semibold">Type</th>
                      <th className="p-3 text-sm font-semibold">Required</th>
                      <th className="p-3 text-sm font-semibold">Options</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTemplate.fields.map((field) => (
                      <tr key={field.label} className="border-t">
                        <td className="p-3 font-medium text-gray-900">{field.label}</td>
                        <td className="p-3 text-gray-700">{field.type}</td>
                        <td className="p-3 text-gray-700">{field.required ? 'Yes' : 'No'}</td>
                        <td className="p-3 text-gray-700">{field.options?.join(', ') || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <aside className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-950">Audit evidence</h3>
                  <ul className="mt-3 space-y-2">
                    {selectedTemplate.evidence.map((item) => (
                      <li key={item} className="rounded bg-slate-50 px-3 py-2 text-sm text-gray-700">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  Review each template against the client site, local authority expectations, and care provider policy before going live.
                </div>
              </aside>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)
  if (!session?.user?.businessId) {
    return { redirect: { destination: '/login', permanent: false } }
  }
  return { props: {} }
}
