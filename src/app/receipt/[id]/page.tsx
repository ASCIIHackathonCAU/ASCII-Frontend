'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { FileText, Copy, Printer, Trash2, X } from 'lucide-react'
import { getReceiptById, deleteReceipt } from '@/lib/receiptStorage'
import { Receipt } from '@/lib/receiptTypes'

const buildTemplate = (receipt: Receipt, type: 'optout' | 'inquiry' | 'delete') => {
  if (type === 'optout') {
    return `안녕하세요 ${receipt.entity_name}님,\n\n${receipt.service_name}의 마케팅 메시지 수신을 거부하고자 합니다.\n채널: 이메일/SMS/앱\n문서: ${receipt.doc_type}\n\n감사합니다.`
  }
  if (type === 'inquiry') {
    return `안녕하세요 ${receipt.entity_name}님,\n\n${receipt.service_name}의 데이터 처리에 대한 상세 정보를 요청드립니다.\n보유 기간: ${receipt.retention}\n제3자 제공: ${receipt.third_party_services?.join(', ') || '없음'}\n철회 경로: ${receipt.revoke_path ?? '명확화 필요'}\n\n상세 정보를 회신해 주시기 바랍니다.`
  }
  return `안녕하세요 ${receipt.entity_name}님,\n\n${receipt.service_name}의 개인정보 삭제 또는 정정을 요청드립니다.\n요청 항목: ${receipt.data_items?.join(', ') || '전체'}\n문서: ${receipt.doc_type}\n\n완료 후 확인 부탁드립니다.`
}

export default function ReceiptDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [activeTemplate, setActiveTemplate] = useState<'optout' | 'inquiry' | 'delete'>('optout')
  const [copied, setCopied] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (params?.id) {
      loadReceipt()
    }
  }, [params?.id])

  const loadReceipt = async () => {
    if (!params?.id) return
    try {
      const found = await getReceiptById(params.id)
      setReceipt(found)
    } catch (error) {
      console.error('Failed to load receipt:', error)
      setReceipt(null)
    }
  }

  const templateText = useMemo(() => {
    if (!receipt) return ''
    try {
      return buildTemplate(receipt, activeTemplate)
    } catch {
      return ''
    }
  }, [receipt, activeTemplate])

  const handleCopy = async () => {
    setCopied(false)
    if (!templateText) return
    try {
      await navigator.clipboard.writeText(templateText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore clipboard errors
    }
  }

  const handlePrint = () => {
    if (typeof window === 'undefined') return
    window.print()
  }

  const handleDeleteConfirm = async () => {
    if (!receipt) return
    try {
      await deleteReceipt(receipt.id)
      if (document.referrer && document.referrer.includes('/consent-dashboard')) {
        router.push('/consent-dashboard')
      } else {
        router.push('/ingest')
      }
    } catch (error) {
      console.error('Failed to delete receipt:', error)
      alert('영수증 삭제에 실패했습니다.')
    }
  }

  if (!receipt) {
    return (
      <main className="min-h-screen bg-[#f6f1e8]">
        <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-12">
          <Link href="/consent-dashboard" className="text-sm font-semibold text-[#de3f1c] hover:underline">
            내 동의 현황으로 돌아가기
          </Link>
          <div className="rounded-3xl border border-[#e4d4c3] bg-white p-6 text-sm text-[#6b5a4b]">
            영수증을 불러올 수 없습니다.
          </div>
        </div>
      </main>
    )
  }

  const overBadge = receipt.over_collection
    ? 'bg-[#ffe0cc] text-[#b23b1e] border border-[#f1b59f]'
    : 'bg-[#e6f6ee] text-[#1e5b3a] border border-[#b7d6c6]'

  return (
    <main className="min-h-screen bg-[#f6f1e8]">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-12">
        <div className="flex items-center justify-between">
          <Link href="/consent-dashboard" className="text-sm font-semibold text-[#de3f1c] hover:underline">
            내 동의 현황으로 돌아가기
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 rounded-2xl border border-[#f1b59f] bg-[#ffe0cc] px-4 py-2 text-sm font-semibold text-[#b23b1e] transition hover:bg-[#ffd4b3]"
          >
            <Trash2 className="h-4 w-4" />
            삭제
          </button>
        </div>

        <section className="rounded-3xl border border-[#e4d4c3] bg-white p-6 shadow-[0_16px_40px_rgba(50,36,28,0.08)]">
          <div className="flex items-center gap-2 text-base font-semibold text-[#1b1410]">
            <FileText className="h-4 w-4 text-[#de3f1c]" />
            영수증 상세
          </div>
          <p className="mt-2 text-sm text-[#6b5a4b]">생성된 영수증의 세부 정보를 확인하세요.</p>

          <div className="mt-6 space-y-4">
            <div>
              <h1 className="text-2xl font-semibold text-[#1b1410]">{receipt.service_name}</h1>
              <p className="mt-2 text-sm text-[#6b5a4b]">{receipt.summary}</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <DetailCard label="서비스명" value={receipt.service_name} />
              <DetailCard label="기관명" value={receipt.entity_name} />
              <DetailCard label="문서 종류" value={receipt.doc_type} />
              <DetailCard
                label="수신 일시"
                value={
                  receipt.received_at
                    ? new Date(receipt.received_at).toLocaleString('ko-KR')
                    : '정보 없음'
                }
              />
              <DetailCard label="필수 수집 항목" value={receipt.required_items?.join(', ') || receipt.data_items?.join(', ') || '없음'} />
              <DetailCard label="선택 수집 항목" value={receipt.optional_items?.join(', ') || '없음'} />
              <div className="rounded-2xl border border-[#e4d4c3] bg-[#fffaf4] p-4 text-sm text-[#6b5a4b]">
                <p className="font-semibold text-[#1b1410]">과잉 수집</p>
                <p className="mt-2">
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${overBadge}`}>
                    {receipt.over_collection ? '의심됨' : '없음'}
                  </span>
                </p>
                {receipt.over_collection_reasons && receipt.over_collection_reasons.length > 0 && (
                  <ul className="mt-2 list-disc pl-4 text-xs text-[#8b6b53]">
                    {receipt.over_collection_reasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                )}
              </div>
              <DetailCard label="보유 기간" value={receipt.retention || '미기재'} />
              <DetailCard label="철회 경로" value={receipt.revoke_path || '명확화 필요'} className="md:col-span-2" />
              <div className="rounded-2xl border border-[#e4d4c3] bg-[#fffaf4] p-4 text-sm text-[#6b5a4b] md:col-span-2">
                <p className="font-semibold text-[#1b1410]">데이터 전송/제3자/국외 이전</p>
                {receipt.transfers && receipt.transfers.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {receipt.transfers.map((t, idx) => (
                      <li
                        key={`${t.destination}-${idx}`}
                        className="flex flex-wrap items-center gap-2 rounded-xl border border-[#e4d4c3] bg-white px-3 py-2"
                      >
                        <span className="rounded-full bg-[#f6f1e8] px-2.5 py-1 text-xs font-semibold text-[#8b6b53]">
                          {t.type}
                        </span>
                        {t.is_overseas && (
                          <span className="rounded-full bg-[#ffe0cc] px-2.5 py-1 text-xs font-semibold text-[#b23b1e]">
                            국외
                          </span>
                        )}
                        <span className="text-sm text-[#1b1410]">{t.destination}</span>
                        {t.data_items && t.data_items.length > 0 && (
                          <span className="text-xs text-[#6b5a4b]">
                            {t.data_items.slice(0, 3).join(', ')}
                            {t.data_items.length > 3 ? ` 외 ${t.data_items.length - 3}개` : ''}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-[#6b5a4b]">전송/제공 정보 없음</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {receipt.evidence && receipt.evidence.length > 0 && (
          <section className="rounded-3xl border border-[#e4d4c3] bg-white p-6 shadow-[0_16px_40px_rgba(50,36,28,0.08)]">
          <div className="flex items-center gap-2 text-base font-semibold text-[#1b1410]">
            <FileText className="h-4 w-4 text-[#de3f1c]" />
            근거 스니펫
          </div>
          <p className="mt-2 text-sm text-[#6b5a4b]">추출된 근거 문장을 확인하세요.</p>

            <ul className="mt-6 space-y-3">
              {receipt.evidence.map((item, index) => (
                <li
                  key={`${item.field}-${index}`}
                  className="rounded-2xl border border-[#e4d4c3] bg-[#fffaf4] p-4"
                >
                  <p className="text-base font-semibold text-[#1b1410]">{item.field}</p>
                  <p className="mt-2 text-sm text-[#6b5a4b]">"{item.quote}"</p>
                  <p className="mt-2 text-sm text-[#8b6b53]">{item.why}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="rounded-3xl border border-[#e4d4c3] bg-white p-6 shadow-[0_16px_40px_rgba(50,36,28,0.08)]">
          <div className="flex items-center gap-2 text-base font-semibold text-[#1b1410]">
            <FileText className="h-4 w-4 text-[#de3f1c]" />
            요청 템플릿
          </div>
          <p className="mt-2 text-sm text-[#6b5a4b]">요청서를 만들어 복사하거나 인쇄하세요.</p>

          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTemplate('optout')}
                className={`rounded-2xl border px-4 py-2 text-xs font-semibold transition ${
                  activeTemplate === 'optout'
                    ? 'border-[#de3f1c] bg-[#de3f1c] text-white'
                    : 'border-[#e4d4c3] bg-white text-[#1b1410] hover:bg-[#fffaf4]'
                }`}
              >
                수신 거부
              </button>
              <button
                onClick={() => setActiveTemplate('inquiry')}
                className={`rounded-2xl border px-4 py-2 text-xs font-semibold transition ${
                  activeTemplate === 'inquiry'
                    ? 'border-[#de3f1c] bg-[#de3f1c] text-white'
                    : 'border-[#e4d4c3] bg-white text-[#1b1410] hover:bg-[#fffaf4]'
                }`}
              >
                문의
              </button>
              <button
                onClick={() => setActiveTemplate('delete')}
                className={`rounded-2xl border px-4 py-2 text-xs font-semibold transition ${
                  activeTemplate === 'delete'
                    ? 'border-[#de3f1c] bg-[#de3f1c] text-white'
                    : 'border-[#e4d4c3] bg-white text-[#1b1410] hover:bg-[#fffaf4]'
                }`}
              >
                삭제/정정
              </button>
            </div>
            <textarea
              readOnly
              className="h-40 w-full rounded-2xl border border-[#e4d4c3] bg-[#fffaf4] p-4 text-sm text-[#1b1410] focus:border-[#de3f1c] focus:outline-none"
              value={templateText}
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 rounded-2xl bg-[#1b1410] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2d241f]"
              >
                <Copy className="h-4 w-4" />
                텍스트 복사
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 rounded-2xl border border-[#e4d4c3] bg-white px-4 py-2 text-sm font-semibold text-[#1b1410] transition hover:bg-[#fffaf4]"
              >
                <Printer className="h-4 w-4" />
                인쇄 / PDF 저장
              </button>
              {copied && <span className="text-xs font-semibold text-[#1e5b3a]">복사 완료</span>}
            </div>
          </div>
        </section>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-3xl border border-[#e4d4c3] bg-white p-6 shadow-[0_20px_50px_rgba(15,11,9,0.3)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#1b1410]">영수증 삭제</h3>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg p-1 text-[#6b5a4b] transition hover:bg-[#fffaf4]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-6 text-sm text-[#6b5a4b]">이 영수증을 삭제할까요? 기록에서 영구 삭제됩니다.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
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

function DetailCard({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={`rounded-2xl border border-[#e4d4c3] bg-[#fffaf4] p-5 text-sm text-[#6b5a4b] ${className ?? ''}`}>
      <p className="font-semibold text-[#1b1410]">{label}</p>
      <p className="mt-2 text-base text-[#2d241f]">{value}</p>
    </div>
  )
}
