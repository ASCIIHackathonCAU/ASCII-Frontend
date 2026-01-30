'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { BarChart3 } from 'lucide-react'
import { listReceipts } from '@/lib/receiptClient'
import { Receipt } from '@/lib/receiptTypes'

export default function DashboardPage() {
  const receipts: Receipt[] = useMemo(() => {
    const result = listReceipts()
    return Array.isArray(result) ? result : []
  }, [])

  const monthCounts: Record<string, number> = {}
  receipts.forEach((receipt) => {
    if (receipt.received_at) {
      const month = receipt.received_at.slice(0, 7)
      monthCounts[month] = (monthCounts[month] ?? 0) + 1
    }
  })

  const thirdPartyCount = new Set(
    receipts.flatMap((receipt) => receipt.third_party_services || [])
  ).size

  const unclearRevokeCount = receipts.filter(
    (receipt) => !receipt.revoke_path || receipt.revoke_path.includes('Needs')
  ).length

  const longRetentionCount = receipts.filter(
    (receipt) => receipt.retention_days && receipt.retention_days >= 365
  ).length

  const categoryCounts: Record<string, number> = {}
  receipts.forEach((receipt) => {
    const category = receipt.category || 'UNKNOWN'
    categoryCounts[category] = (categoryCounts[category] ?? 0) + 1
  })

  return (
    <main className="min-h-screen bg-[#f6f1e8]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b6b53]">
              Module A
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-[#1b1410]">
              Pattern Dashboard
            </h1>
            <p className="mt-2 text-sm text-[#6b5a4b]">
              영수증 패턴 통계와 분포를 확인합니다.
            </p>
          </div>
        </header>

        <section className="rounded-3xl border border-[#e4d4c3] bg-white p-6 shadow-[0_16px_40px_rgba(50,36,28,0.08)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1b1410]">
            <BarChart3 className="h-4 w-4 text-[#de3f1c]" />
            통계 요약
          </div>
          <p className="mt-2 text-xs text-[#6b5a4b]">
            월별 수신 건수, 제3자 제공, 철회 경로, 보관 기간 등을 보여줍니다.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#e4d4c3] bg-[#fffaf4] p-5">
              <h2 className="text-sm font-semibold text-[#1b1410]">월별 수신 건수</h2>
              <ul className="mt-3 space-y-1 text-xs text-[#6b5a4b]">
                {Object.entries(monthCounts).map(([month, count]) => (
                  <li key={month} className="flex items-center justify-between">
                    <span>{month}</span>
                    <span className="font-semibold text-[#1b1410]">{count}</span>
                  </li>
                ))}
                {Object.keys(monthCounts).length === 0 && (
                  <li className="text-[#6b5a4b]">데이터 없음</li>
                )}
              </ul>
            </div>

            <div className="rounded-2xl border border-[#e4d4c3] bg-[#fffaf4] p-5">
              <h2 className="text-sm font-semibold text-[#1b1410]">제3자 제공 서비스</h2>
              <p className="mt-3 text-3xl font-semibold text-[#1b1410]">{thirdPartyCount}</p>
              <p className="mt-1 text-xs text-[#6b5a4b]">고유 서비스 수</p>
            </div>

            <div className="rounded-2xl border border-[#e4d4c3] bg-[#fffaf4] p-5">
              <h2 className="text-sm font-semibold text-[#1b1410]">불명확한 철회 경로</h2>
              <p className="mt-3 text-3xl font-semibold text-[#1b1410]">{unclearRevokeCount}</p>
              <p className="mt-1 text-xs text-[#6b5a4b]">명확한 경로가 없는 문서</p>
            </div>

            <div className="rounded-2xl border border-[#e4d4c3] bg-[#fffaf4] p-5">
              <h2 className="text-sm font-semibold text-[#1b1410]">장기 보관</h2>
              <p className="mt-3 text-3xl font-semibold text-[#1b1410]">{longRetentionCount}</p>
              <p className="mt-1 text-xs text-[#6b5a4b]">365일 이상 보관</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[#e4d4c3] bg-white p-6 shadow-[0_16px_40px_rgba(50,36,28,0.08)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1b1410]">
            <BarChart3 className="h-4 w-4 text-[#de3f1c]" />
            카테고리 분포
          </div>
          <p className="mt-2 text-xs text-[#6b5a4b]">
            문서 카테고리별 수신 건수를 보여줍니다.
          </p>

          <ul className="mt-6 space-y-2">
            {Object.entries(categoryCounts).map(([category, count]) => (
              <li
                key={category}
                className="flex items-center justify-between rounded-2xl border border-[#e4d4c3] bg-[#fffaf4] px-4 py-3"
              >
                <span className="text-sm font-semibold text-[#1b1410]">{category}</span>
                <span className="rounded-full border border-[#e4d4c3] bg-white px-3 py-1 text-xs font-semibold text-[#6b5a4b]">
                  {count}
                </span>
              </li>
            ))}
            {Object.keys(categoryCounts).length === 0 && (
              <li className="rounded-2xl border border-[#e4d4c3] bg-white p-4 text-sm text-[#6b5a4b]">
                데이터 없음
              </li>
            )}
          </ul>
        </section>

        <div className="flex justify-start">
          <Link
            href="/ingest"
            className="text-sm font-semibold text-[#de3f1c] hover:underline"
          >
            ← Ingest로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  )
}

