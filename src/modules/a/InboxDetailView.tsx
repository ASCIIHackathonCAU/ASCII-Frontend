'use client'

import Link from 'next/link'
import { FileText, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { docTypeLabelMap, DocumentListItem } from '@/lib/inboxData'

type Props = {
  document: DocumentListItem | null
}

const riskStyleMap = {
  LOW: 'border-[#b7d6c6] bg-[#e6f6ee] text-[#1e5b3a]',
  MED: 'border-[#f1c7a8] bg-[#ffe8d5] text-[#8a4a1f]',
  HIGH: 'border-[#f1b59f] bg-[#ffe0cc] text-[#b23b1e]',
} as const

const severityStyleMap = {
  low: 'border-[#b7d6c6] bg-[#e6f6ee] text-[#1e5b3a]',
  medium: 'border-[#f1c7a8] bg-[#ffe8d5] text-[#8a4a1f]',
  high: 'border-[#f1b59f] bg-[#ffe0cc] text-[#b23b1e]',
} as const

export default function InboxDetailView({ document }: Props) {
  if (!document) {
    return (
      <main className="min-h-screen bg-[#f6f1e8]">
        <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-16">
          <Link href="/inbox" className="text-sm font-semibold text-[#de3f1c] hover:underline">
            ← Inbox로 돌아가기
          </Link>
          <div className="rounded-3xl border border-[#e4d4c3] bg-white p-6 text-sm text-[#6b5a4b]">
            문서를 찾을 수 없습니다. Mock 모드를 확인하세요.
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f6f1e8]">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-12">
        <div className="flex gap-4">
          <Link href="/" className="text-sm font-semibold text-[#de3f1c] hover:underline">
            ← 메인으로
          </Link>
          <Link href="/inbox" className="text-sm font-semibold text-[#de3f1c] hover:underline">
            ← Inbox로 돌아가기
          </Link>
        </div>

        <section className="rounded-3xl border border-[#e4d4c3] bg-white p-6 shadow-[0_16px_40px_rgba(50,36,28,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-[#8b6b53]">
                {document.entity_name}
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-[#1b1410]">
                {document.title}
              </h1>
              <p className="mt-3 text-sm text-[#6b5a4b]">
                {document.summary_line}
              </p>
            </div>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskStyleMap[document.risk_level]}`}
            >
              {document.risk_level}
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#e4d4c3] bg-[#fffaf4] p-4 text-xs text-[#6b5a4b]">
              <p className="font-semibold text-[#1b1410]">문서 타입</p>
              <p className="mt-2">{docTypeLabelMap[document.doc_type]}</p>
            </div>
            <div className="rounded-2xl border border-[#e4d4c3] bg-[#fffaf4] p-4 text-xs text-[#6b5a4b]">
              <p className="font-semibold text-[#1b1410]">수신 일자</p>
              <p className="mt-2">
                {new Date(document.received_at).toLocaleString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="rounded-2xl border border-[#e4d4c3] bg-[#fffaf4] p-4 text-xs text-[#6b5a4b]">
              <p className="font-semibold text-[#1b1410]">문서 ID</p>
              <p className="mt-2 font-mono">{document.id}</p>
            </div>
            <div className="rounded-2xl border border-[#e4d4c3] bg-[#fffaf4] p-4 text-xs text-[#6b5a4b]">
              <p className="font-semibold text-[#1b1410]">위험도</p>
              <p className="mt-2">
                <span
                  className={`inline-block rounded-full border px-2 py-1 text-xs font-semibold ${riskStyleMap[document.risk_level]}`}
                >
                  {document.risk_level}
                </span>
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[#e4d4c3] bg-white p-6 shadow-[0_16px_40px_rgba(50,36,28,0.08)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1b1410]">
            <Info className="h-4 w-4 text-[#de3f1c]" />
            문서 요약
          </div>
          <p className="mt-2 text-xs text-[#6b5a4b]">
            문서의 주요 정보를 요약합니다.
          </p>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-[#e4d4c3] bg-[#fffaf4] p-4">
              <p className="text-sm font-semibold text-[#1b1410]">기관/서비스</p>
              <p className="mt-2 text-sm text-[#6b5a4b]">{document.entity_name}</p>
            </div>
            <div className="rounded-2xl border border-[#e4d4c3] bg-[#fffaf4] p-4">
              <p className="text-sm font-semibold text-[#1b1410]">문서 제목</p>
              <p className="mt-2 text-sm text-[#6b5a4b]">{document.title}</p>
            </div>
            <div className="rounded-2xl border border-[#e4d4c3] bg-[#fffaf4] p-4">
              <p className="text-sm font-semibold text-[#1b1410]">요약</p>
              <p className="mt-2 text-sm text-[#6b5a4b]">{document.summary_line}</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[#e4d4c3] bg-white p-6 shadow-[0_16px_40px_rgba(50,36,28,0.08)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1b1410]">
            <AlertTriangle className="h-4 w-4 text-[#de3f1c]" />
            위험 신호
          </div>
          <p className="mt-2 text-xs text-[#6b5a4b]">
            문서에서 감지된 위험 신호를 확인합니다.
          </p>

          <div className="mt-6 space-y-3">
            {document.risk_level === 'HIGH' && (
              <div className="rounded-2xl border border-[#f1b59f] bg-[#ffe0cc] p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-[#b23b1e] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-[#b23b1e]">고위험</p>
                    <p className="mt-1 text-xs text-[#8a4a1f]">
                      이 문서는 고위험 요청으로 분류되었습니다. 민감한 정보 요구나 비정상적인 요청이 포함되어 있을 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {document.risk_level === 'MED' && (
              <div className="rounded-2xl border border-[#f1c7a8] bg-[#ffe8d5] p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-[#8a4a1f] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-[#8a4a1f]">중위험</p>
                    <p className="mt-1 text-xs text-[#6b5a4b]">
                      이 문서는 중위험으로 분류되었습니다. 일부 주의가 필요한 항목이 포함되어 있을 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {document.risk_level === 'LOW' && (
              <div className="rounded-2xl border border-[#b7d6c6] bg-[#e6f6ee] p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#1e5b3a] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-[#1e5b3a]">저위험</p>
                    <p className="mt-1 text-xs text-[#6b5a4b]">
                      이 문서는 저위험으로 분류되었습니다. 일반적인 개인정보 처리 관련 내용입니다.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-[#e4d4c3] bg-white p-6 shadow-[0_16px_40px_rgba(50,36,28,0.08)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1b1410]">
            <FileText className="h-4 w-4 text-[#de3f1c]" />
            문서 상세 정보
          </div>
          <p className="mt-2 text-xs text-[#6b5a4b]">
            문서의 상세 정보를 확인합니다.
          </p>

          <div className="mt-6 space-y-3">
            <div className="rounded-2xl border border-[#e4d4c3] bg-[#fffaf4] p-4">
              <p className="text-xs font-semibold text-[#8b6b53] uppercase">문서 타입</p>
              <p className="mt-1 text-sm text-[#1b1410]">{docTypeLabelMap[document.doc_type]}</p>
              <p className="mt-2 text-xs text-[#6b5a4b]">
                {document.doc_type === 'POLICY_UPDATE' &&
                  '정책 또는 약관이 업데이트되었습니다.'}
                {document.doc_type === 'CONSENT_FORM' &&
                  '개인정보 수집 및 이용에 대한 동의서입니다.'}
                {document.doc_type === 'DATA_REQUEST' &&
                  '개인정보 관련 요청(삭제, 수정, 조회 등)입니다.'}
                {document.doc_type === 'HIGH_RISK_REQUEST' &&
                  '고위험 요청으로 분류된 문서입니다.'}
              </p>
            </div>

            <div className="rounded-2xl border border-[#e4d4c3] bg-[#fffaf4] p-4">
              <p className="text-xs font-semibold text-[#8b6b53] uppercase">수신 일시</p>
              <p className="mt-1 text-sm text-[#1b1410]">
                {new Date(document.received_at).toLocaleString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div className="rounded-2xl border border-[#e4d4c3] bg-[#fffaf4] p-4">
              <p className="text-xs font-semibold text-[#8b6b53] uppercase">기관 정보</p>
              <p className="mt-1 text-sm text-[#1b1410]">{document.entity_name}</p>
            </div>
          </div>
        </section>

        {document.doc_type === 'HIGH_RISK_REQUEST' && (
          <section className="rounded-3xl border-2 border-[#f1b59f] bg-[#fff4e6] p-6 shadow-[0_16px_40px_rgba(50,36,28,0.08)]">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#b23b1e]">
              <AlertTriangle className="h-4 w-4" />
              고위험 요청 주의사항
            </div>
            <div className="mt-4 space-y-2 text-sm text-[#8a4a1f]">
              <p>• 이 문서는 고위험 요청으로 분류되었습니다.</p>
              <p>• OTP, 계좌번호, 주민번호 등 민감한 정보 요구가 포함되어 있을 수 있습니다.</p>
              <p>• 요청의 정당성을 신중히 검토하시기 바랍니다.</p>
              <p>• 의심스러운 경우 해당 기관에 직접 문의하시기 바랍니다.</p>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
