import { useCallback, useEffect, useMemo, useState } from 'react'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { getSession } from 'next-auth/react'
import { AppShell } from '@/components/AppShell'
import { formatDateTime } from '@/lib/utils'
import {
  ComplianceTemplate,
  ComplianceTemplateCategory,
  ComplianceTemplateField,
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

const frequencies = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual']

interface ComplianceRecordRow {
  id: string
  templateId: string
  title: string
  category: string
  values: Record<string, string | boolean>
  createdAt: string
  completedByUser: { name: string; email: string }
}

interface ComplianceScheduleRow {
  id: string
  templateId: string
  title: string
  category: string
  frequency: string
  owner: string
  nextDueAt: string
  lastCompletedAt: string | null
  isActive: boolean
}

type FormValues = Record<string, string | boolean>

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

function emptyValues(template: ComplianceTemplate): FormValues {
  return Object.fromEntries(template.fields.map((field) => [field.label, field.type === 'checkbox' ? false : '']))
}

function csvEscape(value: string | boolean) {
  return `"${String(value).replace(/"/g, '""')}"`
}

function recordToCsv(record: ComplianceRecordRow) {
  const labels = Object.keys(record.values)
  const headers = ['Completed at', 'Completed by', 'Document', ...labels]
  const row = [
    record.createdAt,
    record.completedByUser.name,
    record.title,
    ...labels.map((label) => record.values[label]),
  ]
  return `${headers.map(csvEscape).join(',')}\n${row.map(csvEscape).join(',')}\n`
}

function downloadTemplateCsv(template: ComplianceTemplate) {
  downloadFile(`${slugify(template.title)}-blank.csv`, templateToCsv(template), 'text/csv;charset=utf-8')
}

function downloadTemplateJson(template: ComplianceTemplate) {
  downloadFile(
    `${slugify(template.title)}-template.json`,
    JSON.stringify(template, null, 2),
    'application/json;charset=utf-8'
  )
}

function downloadRecord(record: ComplianceRecordRow) {
  downloadFile(`${slugify(record.title)}-${record.id}.csv`, recordToCsv(record), 'text/csv;charset=utf-8')
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

function scheduleStatus(schedule: ComplianceScheduleRow) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(schedule.nextDueAt)
  due.setHours(0, 0, 0, 0)
  if (due < today) return 'Overdue'
  if (due.getTime() === today.getTime()) return 'Due today'
  return 'Upcoming'
}

function statusClass(status: string) {
  if (status === 'Overdue') return 'bg-red-50 text-red-700 border-red-200'
  if (status === 'Due today') return 'bg-amber-50 text-amber-800 border-amber-200'
  return 'bg-green-50 text-green-700 border-green-200'
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: ComplianceTemplateField
  value: string | boolean
  onChange: (value: string | boolean) => void
}) {
  const baseClass = 'mt-1 w-full rounded border p-2'

  if (field.type === 'textarea') {
    return (
      <textarea
        className={baseClass}
        rows={4}
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => onChange(event.target.value)}
        required={field.required}
      />
    )
  }

  if (field.type === 'select') {
    return (
      <select
        className={baseClass}
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => onChange(event.target.value)}
        required={field.required}
      >
        <option value="">Select...</option>
        {field.options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    )
  }

  if (field.type === 'checkbox') {
    return (
      <label className="mt-2 flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
        />
        Completed / confirmed
      </label>
    )
  }

  return (
    <input
      className={baseClass}
      type={field.type === 'signature' ? 'text' : field.type}
      value={typeof value === 'string' ? value : ''}
      onChange={(event) => onChange(event.target.value)}
      required={field.required}
      placeholder={field.type === 'signature' ? 'Type name as sign-off' : undefined}
    />
  )
}

export default function Compliance() {
  const [category, setCategory] = useState<ComplianceTemplateCategory | 'All'>('All')
  const [selectedId, setSelectedId] = useState(complianceTemplates[0].id)
  const [query, setQuery] = useState('')
  const [records, setRecords] = useState<ComplianceRecordRow[]>([])
  const [schedules, setSchedules] = useState<ComplianceScheduleRow[]>([])
  const [selectedScheduleId, setSelectedScheduleId] = useState('')
  const [scheduleForm, setScheduleForm] = useState({
    templateId: complianceTemplates[0].id,
    frequency: 'Daily',
    nextDueAt: toDateInputValue(new Date()),
    owner: complianceTemplates[0].owner,
  })
  const [values, setValues] = useState<FormValues>(() => emptyValues(complianceTemplates[0]))
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

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
    complianceTemplates.find((template) => template.id === selectedId) ||
    filteredTemplates[0] ||
    complianceTemplates[0]

  const selectedRecords = records.filter((record) => record.templateId === selectedTemplate.id)
  const totalFields = complianceTemplates.reduce((sum, template) => sum + template.fields.length, 0)
  const requiredFields = selectedTemplate.fields.filter((field) => field.required).length
  const activeSchedules = schedules.filter((schedule) => schedule.isActive)
  const dueSchedules = activeSchedules.filter((schedule) => ['Overdue', 'Due today'].includes(scheduleStatus(schedule)))
  const upcomingSchedules = activeSchedules.slice(0, 8)

  const loadRecords = useCallback(async () => {
    const res = await fetch('/api/compliance/records')
    if (!res.ok) {
      setError('Unable to load completed compliance records.')
      return
    }
    setRecords(await res.json())
  }, [])

  const loadSchedules = useCallback(async () => {
    const res = await fetch('/api/compliance/schedules')
    if (!res.ok) {
      setError('Unable to load compliance schedules.')
      return
    }
    setSchedules(await res.json())
  }, [])

  useEffect(() => {
    loadRecords()
    loadSchedules()
  }, [loadRecords, loadSchedules])

  useEffect(() => {
    setValues(emptyValues(selectedTemplate))
    setError('')
    setSuccess('')
  }, [selectedTemplate])

  function startScheduledForm(schedule: ComplianceScheduleRow) {
    setSelectedId(schedule.templateId)
    setSelectedScheduleId(schedule.id)
    setSuccess(`Completing scheduled task due ${formatDateTime(schedule.nextDueAt)}.`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function createSchedule(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setSuccess('')
    const res = await fetch('/api/compliance/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scheduleForm),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Unable to create compliance schedule.')
      return
    }
    setSchedules([data, ...schedules])
    setSuccess('Compliance schedule created.')
  }

  async function saveRecord(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    const res = await fetch('/api/compliance/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: selectedTemplate.id, values, scheduleId: selectedScheduleId || undefined }),
    })

    setSaving(false)
    const data = await res.json()
    if (!res.ok) {
      setError(data.fields ? `Missing required fields: ${data.fields.join(', ')}` : data.error || 'Unable to save compliance record.')
      return
    }

    setRecords([data, ...records])
    await loadSchedules()
    setSelectedScheduleId('')
    setValues(emptyValues(selectedTemplate))
    setSuccess('Compliance record saved.')
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Compliance documents</h1>
            <p className="mt-2 max-w-3xl text-gray-600">
              Select a compliance document, complete the form, and keep the saved record ready for audit review.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => downloadTemplateCsv(selectedTemplate)} className="rounded bg-accent px-4 py-2 text-sm font-medium text-white">
              Blank CSV
            </button>
            <button onClick={() => downloadTemplateJson(selectedTemplate)} className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800">
              Template file
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded border bg-white p-4">
            <p className="text-sm text-gray-500">Documents</p>
            <p className="mt-2 text-3xl font-semibold">{complianceTemplates.length}</p>
          </div>
          <div className="rounded border bg-white p-4">
            <p className="text-sm text-gray-500">Template fields</p>
            <p className="mt-2 text-3xl font-semibold">{totalFields}</p>
          </div>
          <div className="rounded border bg-white p-4">
            <p className="text-sm text-gray-500">Completed records</p>
            <p className="mt-2 text-3xl font-semibold">{records.length}</p>
          </div>
          <div className="rounded border bg-white p-4">
            <p className="text-sm text-gray-500">Due now</p>
            <p className="mt-2 text-3xl font-semibold">{dueSchedules.length}</p>
          </div>
        </div>

        <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="rounded border bg-white">
            <div className="border-b p-4">
              <h2 className="text-lg font-semibold">Compliance task schedule</h2>
              <p className="mt-1 text-sm text-gray-600">Recurring documents due today or overdue appear first.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-3 text-sm font-semibold">Task</th>
                    <th className="p-3 text-sm font-semibold">Frequency</th>
                    <th className="p-3 text-sm font-semibold">Next due</th>
                    <th className="p-3 text-sm font-semibold">Status</th>
                    <th className="p-3 text-sm font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingSchedules.length === 0 ? (
                    <tr>
                      <td className="p-6 text-sm text-gray-500" colSpan={5}>No recurring compliance tasks scheduled yet.</td>
                    </tr>
                  ) : (
                    upcomingSchedules.map((schedule) => {
                      const status = scheduleStatus(schedule)
                      return (
                        <tr key={schedule.id} className="border-t">
                          <td className="p-3">
                            <p className="font-medium text-gray-950">{schedule.title}</p>
                            <p className="text-sm text-gray-500">{schedule.owner}</p>
                          </td>
                          <td className="p-3 text-gray-700">{schedule.frequency}</td>
                          <td className="p-3 text-gray-700">{formatDateTime(schedule.nextDueAt)}</td>
                          <td className="p-3">
                            <span className={`rounded border px-2 py-1 text-xs font-medium ${statusClass(status)}`}>{status}</span>
                          </td>
                          <td className="p-3">
                            <button onClick={() => startScheduledForm(schedule)} className="rounded bg-accent px-3 py-1 text-sm text-white">
                              Complete
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <form onSubmit={createSchedule} className="rounded border bg-white p-4">
            <h2 className="text-lg font-semibold">Create recurring task</h2>
            <label className="mt-4 block">
              <span className="text-sm font-medium text-gray-700">Document</span>
              <select
                className="mt-1 w-full rounded border p-2"
                value={scheduleForm.templateId}
                onChange={(event) => {
                  const template = complianceTemplates.find((item) => item.id === event.target.value)
                  setScheduleForm({ ...scheduleForm, templateId: event.target.value, owner: template?.owner || scheduleForm.owner })
                }}
              >
                {complianceTemplates.map((template) => (
                  <option key={template.id} value={template.id}>{template.title}</option>
                ))}
              </select>
            </label>
            <label className="mt-3 block">
              <span className="text-sm font-medium text-gray-700">Frequency</span>
              <select className="mt-1 w-full rounded border p-2" value={scheduleForm.frequency} onChange={(event) => setScheduleForm({ ...scheduleForm, frequency: event.target.value })}>
                {frequencies.map((frequency) => (
                  <option key={frequency} value={frequency}>{frequency}</option>
                ))}
              </select>
            </label>
            <label className="mt-3 block">
              <span className="text-sm font-medium text-gray-700">Next due date</span>
              <input className="mt-1 w-full rounded border p-2" type="date" value={scheduleForm.nextDueAt} onChange={(event) => setScheduleForm({ ...scheduleForm, nextDueAt: event.target.value })} required />
            </label>
            <label className="mt-3 block">
              <span className="text-sm font-medium text-gray-700">Owner</span>
              <input className="mt-1 w-full rounded border p-2" value={scheduleForm.owner} onChange={(event) => setScheduleForm({ ...scheduleForm, owner: event.target.value })} required />
            </label>
            <button className="mt-4 rounded bg-accent px-4 py-2 text-sm font-medium text-white">Create schedule</button>
          </form>
        </section>

        <section className="rounded border bg-white p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Search documents</span>
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

        <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
          <section className="space-y-3">
            {filteredTemplates.length === 0 ? (
              <div className="rounded border bg-white p-6 text-sm text-gray-500">No documents match this filter.</div>
            ) : (
              filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedId(template.id)
                    setSelectedScheduleId('')
                  }}
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
                  <p className="mt-1"><span className="font-medium">Required:</span> {requiredFields} fields</p>
                  {selectedScheduleId && <p className="mt-1"><span className="font-medium">Scheduled task:</span> Yes</p>}
                </div>
              </div>
            </div>

            <form onSubmit={saveRecord} className="grid gap-6 p-6 lg:grid-cols-[1fr_280px]">
              <div className="grid gap-4 md:grid-cols-2">
                {selectedTemplate.fields.map((field) => (
                  <label key={field.label} className={field.type === 'textarea' ? 'block md:col-span-2' : 'block'}>
                    <span className="text-sm font-medium text-gray-700">
                      {field.label}
                      {field.required ? ' *' : ''}
                    </span>
                    <FieldInput
                      field={field}
                      value={values[field.label] ?? (field.type === 'checkbox' ? false : '')}
                      onChange={(nextValue) => setValues({ ...values, [field.label]: nextValue })}
                    />
                  </label>
                ))}

                {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700 md:col-span-2">{error}</div>}
                {success && <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700 md:col-span-2">{success}</div>}

                <div className="md:col-span-2">
                  <button disabled={saving} className="rounded bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                    {saving ? 'Saving...' : 'Save completed form'}
                  </button>
                </div>
              </div>

              <aside className="space-y-4">
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
                  Saved records are retained against this business and include who completed the form and when.
                </div>
              </aside>
            </form>
          </section>
        </div>

        <section className="rounded border bg-white">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Completed forms</h2>
            <p className="mt-1 text-sm text-gray-600">Recent saved records for the selected document and all compliance documents.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3 text-sm font-semibold">Document</th>
                  <th className="p-3 text-sm font-semibold">Completed by</th>
                  <th className="p-3 text-sm font-semibold">Completed</th>
                  <th className="p-3 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td className="p-6 text-sm text-gray-500" colSpan={4}>No completed forms yet.</td>
                  </tr>
                ) : (
                  (selectedRecords.length ? selectedRecords : records).slice(0, 12).map((record) => (
                    <tr key={record.id} className="border-t">
                      <td className="p-3">
                        <p className="font-medium text-gray-950">{record.title}</p>
                        <p className="text-sm text-gray-500">{record.category}</p>
                      </td>
                      <td className="p-3 text-gray-700">{record.completedByUser.name}</td>
                      <td className="p-3 text-gray-700">{formatDateTime(record.createdAt)}</td>
                      <td className="flex gap-2 p-3">
                        <Link href={`/compliance/records/${record.id}`} className="rounded bg-accent px-3 py-1 text-sm text-white">
                          View
                        </Link>
                        <button onClick={() => downloadRecord(record)} className="rounded border border-gray-300 bg-white px-3 py-1 text-sm text-gray-800">
                          Download
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
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
