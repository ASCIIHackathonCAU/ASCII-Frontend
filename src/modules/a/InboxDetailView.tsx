'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, ShieldX } from 'lucide-react'
import { docTypeLabelMap, DocumentListItem } from '@/lib/inboxData'

type Props = {
  document: DocumentListItem | null
}

const riskStyleMap = {
  LOW: 'border-[#b7d6c6] bg-[#e6f6ee] text-[#1e5b3a]',
  MED: 'border-[#f1c7a8] bg-[#ffe8d5] text-[#8a4a1f]',
  HIGH: 'border-[#f1b59f] bg-[#ffe0cc] text-[#b23b1e]',
} as const

export default function InboxDetailView({ document }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'code' | 'token'>('code')
  const [codeInput, setCodeInput] = useState('')
  const [tokenInput, setTokenInput] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [verified, setVerified] = useState(false)

  const locked = !verified
  const codePlaceholder = useMemo(() => '예: 123456', [])

  if (!document) {
    return (
      <main className="min-h-screen bg-[#f6f1e8]">
        <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-16">
          <Link href="/inbox" className="text-sm font-semibold text-[#de3f1c]">
            ← Inbox로 돌아가기
          </Link>
          <div className="rounded-3xl border border-[#e4d4c3] bg-white p-6 text-sm text-[#6b5a4b]">
            문서를 찾을 수 없습니다. Mock 모드를 확인하세요.
          </div>
        </div>
      </main>
    )
  }

  const handleVerify = () => {
    setErrorMessage('')
    if (activeTab === 'code') {
      if (codeInput.trim() === document.verification_code) {
        setVerified(true)
        setIsModalOpen(false)
        setCodeInput('')
        return
      }
      setErrorMessage('코드가 일치하지 않습니다.')
      return
    }
    if (tokenInput.trim() === document.verification_token) {
      setVerified(true)
      setIsModalOpen(false)
      setTokenInput('')
      return
    }
    setErrorMessage('토큰이 유효하지 않습니다.')
  }

  return (
    <main className="min-h-screen bg-[#f6f1e8]">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-12">
        <div className="sticky top-4 z-10 rounded-2xl border border-[#f1c7a8] bg-[#fff4e6] px-4 py-3 text-sm text-[#8a4a1f] shadow-[0_10px_30px_rgba(50,36,28,0.12)]">
          공식 요청 영수증 확인 전에는 민감 입력이 잠겨요.
        </div>

        <Link href="/inbox" className="text-sm font-semibold text-[#de3f1c]">
          ← Inbox로 돌아가기
        </Link>

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
            <div className="rounded-2xl border border-[#e4d4c3] bg-white p-4 text-xs text-[#6b5a4b]">
              <p className="font-semibold text-[#1b1410]">문서 타입</p>
              <p className="mt-2">{docTypeLabelMap[document.doc_type]}</p>
            </div>
            <div className="rounded-2xl border border-[#e4d4c3] bg-white p-4 text-xs text-[#6b5a4b]">
              <p className="font-semibold text-[#1b1410]">수신 일자</p>
              <p className="mt-2">
                {new Date(document.received_at).toLocaleString('ko-KR')}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-[#e4d4c3] bg-[#fffaf4] px-3 py-1 text-xs font-semibold text-[#6b5a4b]">
              {locked ? 'Locked' : 'Verified'}
            </span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="rounded-full bg-[#de3f1c] px-4 py-2 text-xs font-semibold text-white hover:bg-[#c83818]"
            >
              역인증하기
            </button>
            {verified && (
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#1e5b3a]">
                <ShieldCheck className="h-4 w-4" />
                Verified
              </span>
            )}
            {locked && (
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#b23b1e]">
                <ShieldX className="h-4 w-4" />
                민감 입력 잠금
              </span>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-[#e4d4c3] bg-white p-6 shadow-[0_16px_40px_rgba(50,36,28,0.08)]">
          <h2 className="text-lg font-semibold text-[#1b1410]">
            민감 입력 단계 (데모)
          </h2>
          <p className="mt-2 text-xs text-[#6b5a4b]">
            역인증 완료 후에만 입력과 제출이 가능합니다.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input
              disabled={locked}
              className="rounded-xl border border-[#e4d4c3] bg-[#fffaf4] px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="주민번호"
            />
            <input
              disabled={locked}
              className="rounded-xl border border-[#e4d4c3] bg-[#fffaf4] px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="계좌번호"
            />
            <input
              disabled={locked}
              className="rounded-xl border border-[#e4d4c3] bg-[#fffaf4] px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="OTP"
            />
            <button
              disabled={locked}
              className="rounded-xl bg-[#de3f1c] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              제출/입력 CTA
            </button>
          </div>
        </section>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-3xl border border-[#e4d4c3] bg-white p-6 shadow-[0_20px_50px_rgba(15,11,9,0.3)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#1b1410]">
                요청 검증
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-sm font-semibold text-[#6b5a4b]"
              >
                닫기
              </button>
            </div>
            <div className="mt-4 flex gap-2 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('code')}
                className={`flex-1 rounded-full border px-3 py-2 ${
                  activeTab === 'code'
                    ? 'border-[#de3f1c] bg-[#ffe0cc] text-[#1b1410]'
                    : 'border-[#e4d4c3] bg-white text-[#6b5a4b]'
                }`}
              >
                6자리 코드
              </button>
              <button
                onClick={() => setActiveTab('token')}
                className={`flex-1 rounded-full border px-3 py-2 ${
                  activeTab === 'token'
                    ? 'border-[#de3f1c] bg-[#ffe0cc] text-[#1b1410]'
                    : 'border-[#e4d4c3] bg-white text-[#6b5a4b]'
                }`}
              >
                토큰 붙여넣기
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {activeTab === 'code' ? (
                <>
                  <input
                    value={codeInput}
                    onChange={(event) =>
                      setCodeInput(event.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    className="w-full rounded-xl border border-[#e4d4c3] bg-[#fffaf4] px-3 py-2 text-sm"
                    placeholder={codePlaceholder}
                  />
                  <p className="text-xs text-[#6b5a4b]">
                    QR 사용이 어려운 경우 6자리 코드를 입력하세요.
                  </p>
                </>
              ) : (
                <>
                  <textarea
                    value={tokenInput}
                    onChange={(event) => setTokenInput(event.target.value)}
                    className="h-24 w-full rounded-xl border border-[#e4d4c3] bg-[#fffaf4] px-3 py-2 text-sm"
                    placeholder="JWT/PASETO 토큰을 붙여넣으세요."
                  />
                  <p className="text-xs text-[#6b5a4b]">
                    doc_id, issuer, exp를 포함한 서명 토큰을 검증합니다.
                  </p>
                </>
              )}
              {errorMessage && (
                <div className="rounded-xl border border-[#f1b59f] bg-[#ffe0cc] px-3 py-2 text-xs text-[#b23b1e]">
                  {errorMessage}
                </div>
              )}
              <button
                onClick={handleVerify}
                className="w-full rounded-xl bg-[#de3f1c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c83818]"
              >
                검증하기
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
