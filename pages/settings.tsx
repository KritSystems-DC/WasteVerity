import Link from 'next/link'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { AppShell } from '@/components/AppShell'

export default function Settings() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="mt-2 text-gray-600">Manage business details and stock defaults.</p>
        </div>
        <div className="bg-white border rounded p-6">
          <h2 className="text-lg font-semibold">Business setup</h2>
          <p className="mt-2 text-sm text-gray-600">Update your business profile, currency, default unit and low stock alerts.</p>
          <Link href="/setup" className="mt-4 inline-flex rounded bg-accent px-4 py-2 text-white">Open setup</Link>
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
