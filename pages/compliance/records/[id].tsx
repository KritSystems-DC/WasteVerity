import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { getSession } from 'next-auth/react'
import { AppShell } from '@/components/AppShell'
import { prisma } from '@/lib/prisma'
import { formatDateTime } from '@/lib/utils'

interface ComplianceRecordDetailProps {
  record: {
    id: string
    templateId: string
    title: string
    category: string
    cadence: string
    owner: string
    purpose: string
    values: Record<string, string | boolean>
    createdAt: string
    completedByUser: { name: string; email: string }
  }
}

function formatValue(value: string | boolean) {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return value || '-'
}

export default function ComplianceRecordDetail({ record }: ComplianceRecordDetailProps) {
  const entries = Object.entries(record.values)

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link href="/compliance" className="text-sm font-medium text-blue-700 hover:underline">
              Back to compliance documents
            </Link>
            <p className="mt-4 text-sm font-medium text-blue-700">{record.category}</p>
            <h1 className="mt-1 text-2xl font-bold">{record.title}</h1>
            <p className="mt-2 max-w-3xl text-gray-600">{record.purpose}</p>
          </div>
          <button onClick={() => window.print()} className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 print:hidden">
            Print record
          </button>
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded border bg-white p-4">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="mt-2 font-semibold text-gray-950">{formatDateTime(record.createdAt)}</p>
          </div>
          <div className="rounded border bg-white p-4">
            <p className="text-sm text-gray-500">Completed by</p>
            <p className="mt-2 font-semibold text-gray-950">{record.completedByUser.name}</p>
            <p className="text-sm text-gray-600">{record.completedByUser.email}</p>
          </div>
          <div className="rounded border bg-white p-4">
            <p className="text-sm text-gray-500">Record owner</p>
            <p className="mt-2 font-semibold text-gray-950">{record.owner}</p>
          </div>
          <div className="rounded border bg-white p-4">
            <p className="text-sm text-gray-500">Cadence</p>
            <p className="mt-2 font-semibold text-gray-950">{record.cadence}</p>
          </div>
        </section>

        <section className="rounded border bg-white">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Completed form values</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3 text-sm font-semibold">Field</th>
                  <th className="p-3 text-sm font-semibold">Value</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(([label, value]) => (
                  <tr key={label} className="border-t">
                    <td className="w-1/3 p-3 font-medium text-gray-950">{label}</td>
                    <td className="p-3 text-gray-700">{formatValue(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  )
}

export const getServerSideProps: GetServerSideProps<ComplianceRecordDetailProps> = async (context) => {
  const session = await getSession(context)
  const businessId = session?.user?.businessId
  const id = typeof context.params?.id === 'string' ? context.params.id : ''

  if (!businessId) {
    return { redirect: { destination: '/login', permanent: false } }
  }

  const record = await prisma.complianceRecord.findFirst({
    where: { id, businessId },
    include: { completedByUser: { select: { name: true, email: true } } },
  })

  if (!record) return { notFound: true }

  return {
    props: {
      record: {
        id: record.id,
        templateId: record.templateId,
        title: record.title,
        category: record.category,
        cadence: record.cadence,
        owner: record.owner,
        purpose: record.purpose,
        values: record.values as Record<string, string | boolean>,
        createdAt: record.createdAt.toISOString(),
        completedByUser: record.completedByUser,
      },
    },
  }
}
