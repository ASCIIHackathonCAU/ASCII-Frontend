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
    loadReceipts()
  }, [])

  const loadReceipts = async () => {
    try {
      const result = await listReceipts()
      const receiptList = Array.isArray(result) ? result : []
      setReceipts(receiptList)
      // Receipt를 DocumentListItem으로 변환
      setDocuments(receiptList.map(receiptToDocumentListItem))
    } catch (error) {
      console.error('Failed to load receipts:', error)
      setReceipts([])
      setDocuments([])
    }
  }

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return
    try {
      await deleteReceipt(deleteTargetId)
      await loadReceipts()
      setDeleteTargetId(null)
    } catch (error) {
      console.error('Failed to delete receipt:', error)
    }
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
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-5xl font-bold text-[#1b1410] leading-tight">
              통계 대시보드
            </h1>
            <p className="mt-4 text-xl text-[#2d241f] leading-relaxed">
              영수증 패턴 통계와 분포를 확인합니다.
            </p>
          </div>
        </header>

        <section className="rounded-2xl border-4 border-[#2d241f] bg-white p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-8 w-8 text-[#de3f1c]" strokeWidth={2.5} />
            <h2 className="text-2xl font-bold text-[#1b1410]">
              통계 요약
            </h2>
          </div>
          <p className="mb-6 text-lg text-[#2d241f] leading-relaxed">
            월별 수신 건수, 제3자 제공, 철회 경로, 보관 기간 등을 보여줍니다.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border-2 border-[#2d241f] bg-[#fffaf4] p-6">
              <h3 className="text-xl font-bold text-[#1b1410] mb-4">월별 수신 건수</h3>
              <ul className="space-y-3 text-lg text-[#2d241f]">
                {Object.entries(monthCounts).map(([month, count]) => (
                  <li key={month} className="flex items-center justify-between py-2 border-b border-[#e4d4c3]">
                    <span className="font-semibold">{month}</span>
                    <span className="text-2xl font-bold text-[#1b1410]">{count}</span>
                  </li>
                ))}
                {Object.keys(monthCounts).length === 0 && (
                  <li className="text-lg text-[#6b5a4b] py-4">데이터 없음</li>
                )}
              </ul>
            </div>

            <div className="rounded-xl border-2 border-[#2d241f] bg-[#fffaf4] p-6">
              <h3 className="text-xl font-bold text-[#1b1410] mb-4">제3자 제공 서비스</h3>
              <p className="text-5xl font-bold text-[#1b1410] mb-2">{thirdPartyCount}</p>
              <p className="text-lg text-[#2d241f]">고유 서비스 수</p>
            </div>

            <div className="rounded-xl border-2 border-[#2d241f] bg-[#fffaf4] p-6">
              <h3 className="text-xl font-bold text-[#1b1410] mb-4">불명확한 철회 경로</h3>
              <p className="text-5xl font-bold text-[#1b1410] mb-2">{unclearRevokeCount}</p>
              <p className="text-lg text-[#2d241f]">명확한 경로가 없는 문서</p>
            </div>

            <div className="rounded-xl border-2 border-[#2d241f] bg-[#fffaf4] p-6">
              <h3 className="text-xl font-bold text-[#1b1410] mb-4">장기 보관</h3>
              <p className="text-5xl font-bold text-[#1b1410] mb-2">{longRetentionCount}</p>
              <p className="text-lg text-[#2d241f]">365일 이상 보관</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border-4 border-[#2d241f] bg-white p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-8 w-8 text-[#de3f1c]" strokeWidth={2.5} />
            <h2 className="text-2xl font-bold text-[#1b1410]">
              카테고리 분포
            </h2>
          </div>
          <p className="mb-6 text-lg text-[#2d241f] leading-relaxed">
            문서 카테고리별 수신 건수를 보여줍니다.
          </p>

          <ul className="space-y-4">
            {Object.entries(categoryCounts).map(([category, count]) => (
              <li
                key={category}
                className="flex items-center justify-between rounded-xl border-2 border-[#2d241f] bg-[#fffaf4] px-6 py-4"
              >
                <span className="text-xl font-bold text-[#1b1410]">{category}</span>
                <span className="rounded-full border-2 border-[#2d241f] bg-white px-5 py-2 text-xl font-bold text-[#1b1410]">
                  {count}
                </span>
              </li>
            ))}
            {Object.keys(categoryCounts).length === 0 && (
              <li className="rounded-xl border-2 border-[#e4d4c3] bg-white p-6 text-lg text-[#2d241f]">
                데이터 없음
              </li>
            )}
          </ul>
        </section>

        <section className="rounded-2xl border-4 border-[#2d241f] bg-white p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-8 w-8 text-[#de3f1c]" strokeWidth={2.5} />
            <h2 className="text-2xl font-bold text-[#1b1410]">
              저장된 영수증 목록
            </h2>
          </div>
          <p className="mb-6 text-lg text-[#2d241f] leading-relaxed">
            서비스/기관명, 문서 타입, 날짜, 위험도 뱃지를 보여줍니다.
          </p>

          {documents.length === 0 && (
            <div className="rounded-xl border-2 border-[#e4d4c3] bg-[#fffaf4] p-6 text-lg text-[#2d241f]">
              아직 저장된 영수증이 없습니다.
            </div>
          )}
          <div className="grid gap-6 md:grid-cols-2">
            {documents.map((doc) => {
              const receipt = receipts.find((r) => r.id === doc.id)
              return (
                <div
                  key={doc.id}
                  className="group rounded-xl border-2 border-[#2d241f] bg-[#fffaf4] p-6 transition hover:bg-white hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <p className="text-lg font-bold uppercase text-[#8b6b53] mb-2">
                        {doc.entity_name}
                      </p>
                      <h3 className="text-xl font-bold text-[#1b1410] mb-2">
                        {doc.title}
                      </h3>
                    </div>
                    <span
                      className={`rounded-full border-2 px-4 py-2 text-lg font-bold whitespace-nowrap ${riskStyleMap[doc.risk_level]}`}
                    >
                      {doc.risk_level === 'LOW' ? '낮음' : doc.risk_level === 'MED' ? '보통' : '높음'}
                    </span>
                  </div>
                  <div className="mb-4 flex flex-wrap gap-3">
                    <span className="rounded-lg border-2 border-[#2d241f] bg-white px-4 py-2 text-lg font-bold text-[#1b1410]">
                      {docTypeLabelMap[doc.doc_type]}
                    </span>
                    <span className="rounded-lg border-2 border-[#2d241f] bg-white px-4 py-2 text-lg font-bold text-[#1b1410]">
                      {new Date(doc.received_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <p className="mb-4 text-lg text-[#2d241f] leading-relaxed">
                    {doc.summary_line}
                  </p>
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/receipt/${doc.id}`}
                      className="rounded-xl bg-[#de3f1c] px-6 py-3 text-lg font-bold text-white transition hover:bg-[#b23b1e] min-h-[48px] flex items-center"
                    >
                      상세 보기
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(doc.id)}
                      className="rounded-xl bg-[#ffe0cc] p-3 text-[#b23b1e] transition hover:bg-[#f1b59f] min-h-[48px] min-w-[48px] flex items-center justify-center"
                      title="삭제"
                    >
                      <Trash2 className="h-6 w-6" strokeWidth={2.5} />
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
            className="text-lg font-bold text-[#de3f1c] hover:underline py-2"
          >
            ← 메인으로 돌아가기
          </Link>
        </div>
      </div>

      {deleteTargetId && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-2xl border-4 border-[#2d241f] bg-white p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#1b1410]">영수증 삭제</h3>
              <button
                onClick={handleDeleteCancel}
                className="rounded-xl p-2 text-[#2d241f] transition hover:bg-[#fffaf4] min-h-[48px] min-w-[48px] flex items-center justify-center"
              >
                <X className="h-6 w-6" strokeWidth={2.5} />
              </button>
            </div>
            <p className="text-xl text-[#2d241f] mb-8 leading-relaxed">
              이 영수증을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 rounded-xl border-2 border-[#2d241f] bg-white px-6 py-4 text-lg font-bold text-[#1b1410] transition hover:bg-[#fffaf4] min-h-[56px]"
              >
                취소
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 rounded-xl bg-[#b23b1e] px-6 py-4 text-lg font-bold text-white transition hover:bg-[#9a3219] min-h-[56px]"
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

