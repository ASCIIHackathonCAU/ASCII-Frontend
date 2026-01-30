'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { BarChart3, FileText, Trash2, X } from 'lucide-react'
import { listReceipts } from '@/lib/receiptClient'
import { deleteReceipt } from '@/lib/receiptStorage'
import { receiptToDocumentListItem } from '@/lib/receiptUtils'
import { docTypeLabelMap } from '@/lib/inboxData'
import type { DocumentListItem, DocumentRiskLevel } from '@/lib/inboxData'
import { Receipt } from '@/lib/receiptTypes'

const riskStyleMap = {
  LOW: 'border-[#b7d6c6] bg-[#e6f6ee] text-[#1e5b3a]',
  MED: 'border-[#f1c7a8] bg-[#ffe8d5] text-[#8a4a1f]',
  HIGH: 'border-[#f1b59f] bg-[#ffe0cc] text-[#b23b1e]',
} as const

export default function DashboardPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [documents, setDocuments] = useState<DocumentListItem[]>([])
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  useEffect(() => {
    const result = listReceipts()
    const receiptList = Array.isArray(result) ? result : []
    setReceipts(receiptList)
    // Receipt를 DocumentListItem으로 변환
    setDocuments(receiptList.map(receiptToDocumentListItem))
  }, [])

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id)
  }

  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return
    deleteReceipt(deleteTargetId)
    const updatedReceipts = listReceipts()
    setReceipts(updatedReceipts)
    setDocuments(updatedReceipts.map(receiptToDocumentListItem))
    setDeleteTargetId(null)
  }

  const handleDeleteCancel = () => {
    setDeleteTargetId(null)
  }

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

        <section className="rounded-3xl border border-[#e4d4c3] bg-white p-6 shadow-[0_16px_40px_rgba(50,36,28,0.08)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1b1410]">
            <FileText className="h-4 w-4 text-[#de3f1c]" />
            저장된 영수증 목록
          </div>
          <p className="mt-2 text-xs text-[#6b5a4b]">
            서비스/기관명, 문서 타입, 날짜, 위험도 뱃지를 보여줍니다.
          </p>

          {documents.length === 0 && (
            <div className="mt-6 rounded-2xl border border-[#e4d4c3] bg-[#fffaf4] p-4 text-sm text-[#6b5a4b]">
              아직 저장된 영수증이 없습니다.
            </div>
          )}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {documents.map((doc) => {
              const receipt = receipts.find((r) => r.id === doc.id)
              return (
                <div
                  key={doc.id}
                  className="group rounded-2xl border border-[#e4d4c3] bg-[#fffaf4] p-5 transition hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase text-[#8b6b53]">
                        {doc.entity_name}
                      </p>
                      <h2 className="mt-2 text-lg font-semibold text-[#1b1410]">
                        {doc.title}
                      </h2>
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskStyleMap[doc.risk_level]}`}
                    >
                      {doc.risk_level}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#6b5a4b]">
                    <span className="rounded-full border border-[#e4d4c3] bg-white px-3 py-1 font-semibold">
                      {docTypeLabelMap[doc.doc_type]}
                    </span>
                    <span className="rounded-full border border-[#e4d4c3] bg-white px-3 py-1 font-semibold">
                      {new Date(doc.received_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-[#6b5a4b]">
                    {doc.summary_line}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <Link
                      href={`/receipt/${doc.id}`}
                      className="text-xs font-semibold text-[#de3f1c] hover:underline"
                    >
                      상세 보기
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(doc.id)}
                      className="rounded-lg p-1.5 text-[#b23b1e] transition hover:bg-[#ffe0cc]"
                      title="삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <div className="flex justify-start">
          <Link
            href="/"
            className="text-sm font-semibold text-[#de3f1c] hover:underline"
          >
            ← 메인으로 돌아가기
          </Link>
        </div>
      </div>

      {deleteTargetId && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-3xl border border-[#e4d4c3] bg-white p-6 shadow-[0_20px_50px_rgba(15,11,9,0.3)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#1b1410]">영수증 삭제</h3>
              <button
                onClick={handleDeleteCancel}
                className="rounded-lg p-1 text-[#6b5a4b] transition hover:bg-[#fffaf4]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-[#6b5a4b] mb-6">
              이 영수증을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 rounded-2xl border border-[#e4d4c3] bg-white px-4 py-2 text-sm font-semibold text-[#1b1410] transition hover:bg-[#fffaf4]"
              >
                취소
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 rounded-2xl bg-[#b23b1e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#9a3219]"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

