'use client'

import Link from 'next/link'
import { FileText } from 'lucide-react'
import { docTypeLabelMap, getInboxDocuments } from '@/lib/inboxData'

const riskStyleMap = {
  LOW: 'border-[#b7d6c6] bg-[#e6f6ee] text-[#1e5b3a]',
  MED: 'border-[#f1c7a8] bg-[#ffe8d5] text-[#8a4a1f]',
  HIGH: 'border-[#f1b59f] bg-[#ffe0cc] text-[#b23b1e]',
} as const

export default function InboxListView() {
  const documents = getInboxDocuments()
  const mockEnabled = process.env.NEXT_PUBLIC_MOCK === 'true'

  return (
    <main className="min-h-screen bg-[#f6f1e8]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b6b53]">
              Module A
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-[#1b1410]">
              Receipt Inbox
            </h1>
            <p className="mt-2 text-sm text-[#6b5a4b]">
              문서 유형과 위험도를 한눈에 확인하고 상세로 이동합니다.
            </p>
          </div>
          {mockEnabled && (
            <div className="inline-flex items-center gap-3 rounded-full border border-[#e4d4c3] bg-white px-4 py-2 text-sm text-[#6b5a4b]">
              <span className="h-2 w-2 rounded-full bg-[#ff7a59]" />
              Mock Mode ON
            </div>
          )}
        </header>

        <section className="rounded-3xl border border-[#e4d4c3] bg-white p-6 shadow-[0_16px_40px_rgba(50,36,28,0.08)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1b1410]">
            <FileText className="h-4 w-4 text-[#de3f1c]" />
            Inbox 리스트
          </div>
          <p className="mt-2 text-xs text-[#6b5a4b]">
            서비스/기관명, 문서 타입, 날짜, 위험도 뱃지를 보여줍니다.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {documents.map((doc) => (
              <Link
                key={doc.id}
                href={`/inbox/${doc.id}`}
                className="group rounded-2xl border border-[#e4d4c3] bg-[#fffaf4] p-5 transition hover:-translate-y-1"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
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
              </Link>
            ))}
          </div>

          {!documents.length && (
            <div className="mt-6 rounded-2xl border border-[#e4d4c3] bg-white p-4 text-sm text-[#6b5a4b]">
              Mock 모드를 활성화하거나 백엔드 데이터를 연결하세요.
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
