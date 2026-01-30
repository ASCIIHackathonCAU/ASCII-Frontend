'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { listReceipts } from '@/lib/receiptClient'

export default function DashboardPage() {
  const receipts = useMemo(() => listReceipts(), [])

  const monthCounts: Record<string, number> = {}
  receipts.forEach((receipt) => {
    const month = receipt.received_at.slice(0, 7)
    monthCounts[month] = (monthCounts[month] ?? 0) + 1
  })

  const thirdPartyCount = new Set(
    receipts.flatMap((receipt) => receipt.third_party_services)
  ).size

  const unclearRevokeCount = receipts.filter(
    (receipt) => !receipt.revoke_path || receipt.revoke_path.includes('Needs')
  ).length

  const longRetentionCount = receipts.filter(
    (receipt) => receipt.retention_days >= 365
  ).length

  const categoryCounts: Record<string, number> = {}
  receipts.forEach((receipt) => {
    categoryCounts[receipt.category] = (categoryCounts[receipt.category] ?? 0) + 1
  })

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-4xl space-y-8">
        <header className="space-y-2">
          <Link href="/ingest" className="text-xs text-gray-500 underline">
            <- Back to Ingest
          </Link>
          <h1 className="text-3xl font-semibold">Pattern Dashboard</h1>
          <p className="text-sm text-gray-500">
            Summaries of receipt patterns.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="text-sm font-semibold">Month Count</h2>
            <ul className="mt-2 space-y-1 text-xs text-gray-600">
              {Object.entries(monthCounts).map(([month, count]) => (
                <li key={month}>
                  {month}: {count}
                </li>
              ))}
              {Object.keys(monthCounts).length === 0 && (
                <li>No data</li>
              )}
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="text-sm font-semibold">Third-party Services</h2>
            <p className="mt-2 text-2xl font-semibold">{thirdPartyCount}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="text-sm font-semibold">Unclear Revoke Path</h2>
            <p className="mt-2 text-2xl font-semibold">{unclearRevokeCount}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="text-sm font-semibold">Long Retention</h2>
            <p className="mt-2 text-2xl font-semibold">{longRetentionCount}</p>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-semibold">Category Distribution</h2>
          <ul className="mt-2 space-y-1 text-xs text-gray-600">
            {Object.entries(categoryCounts).map(([category, count]) => (
              <li key={category}>
                {category}: {count}
              </li>
            ))}
            {Object.keys(categoryCounts).length === 0 && <li>No data</li>}
          </ul>
        </section>
      </div>
    </main>
  )
}
