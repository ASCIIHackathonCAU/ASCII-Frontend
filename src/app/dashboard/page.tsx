'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock4,
  FileText,
  HelpCircle,
  Home,
  Mail,
  Shield,
  TrendingUp,
  X,
} from 'lucide-react'
import { listReceipts } from '@/lib/receiptClient'
import { deleteReceipt } from '@/lib/receiptStorage'
import { receiptToDocumentListItem } from '@/lib/receiptUtils'
import { docTypeLabelMap } from '@/lib/inboxData'
import type { DocumentListItem } from '@/lib/inboxData'
import { Receipt } from '@/lib/receiptTypes'
import { listRevocationRequests, type RevocationRequest } from '@/lib/api/revocationApi'

type RiskStyle = 'LOW' | 'MED' | 'HIGH'

const riskStyleMap: Record<RiskStyle, string> = {
  LOW: 'border-[#c7e2ff] bg-[#e8f1ff] text-[#0f3d8a]',
  MED: 'border-[#ffe7b3] bg-[#fff7e1] text-[#8a5200]',
  HIGH: 'border-[#fecdd3] bg-[#fff1f2] text-[#b42318]',
}

const statusLabels: Record<string, string> = {
  DRAFT: '작성 중',
  SENT: '전송됨',
  WAITING: '대기',
  DONE: '완료',
  REJECTED: '거절',
  NEED_MORE_INFO: '추가 정보 필요',
}

export default function DashboardPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [documents, setDocuments] = useState<DocumentListItem[]>([])
  const [requests, setRequests] = useState<RevocationRequest[]>([])
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [timelineRange, setTimelineRange] = useState<'3m' | '6m' | 'all'>('6m')
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    loadReceipts()
    loadRequests()
  }, [])

  const loadReceipts = async () => {
    try {
      const result = await listReceipts()
      const list = Array.isArray(result) ? result : []
      setReceipts(list)
      setDocuments(list.map(receiptToDocumentListItem))
    } catch (error) {
      console.error('Failed to load receipts:', error)
      setReceipts([])
      setDocuments([])
    }
  }

  const loadRequests = async () => {
    try {
      const result = await listRevocationRequests()
      setRequests(Array.isArray(result) ? result : [])
    } catch (error) {
      console.error('Failed to load revocation requests:', error)
      setRequests([])
    }
  }

  const handleDeleteClick = (id: string) => setDeleteTargetId(id)

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

  const handleDeleteCancel = () => setDeleteTargetId(null)

  const now = useMemo(() => new Date(), [])

  const timelineBuckets = useMemo(() => {
    const cutoff = (months: number) => {
      const d = new Date(now)
      d.setMonth(d.getMonth() - months)
      return d
    }
    const rangeCutoff =
      timelineRange === '3m' ? cutoff(3) : timelineRange === '6m' ? cutoff(6) : new Date(0)

    const filtered = receipts.filter((r) => new Date(r.received_at) >= rangeCutoff)
    const counts: Record<string, number> = {}
    filtered.forEach((r) => {
      const label = r.received_at.slice(0, 7) // YYYY-MM
      counts[label] = (counts[label] ?? 0) + 1
    })
    const sorted = Object.entries(counts)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([label, count]) => ({ label, count }))
    return sorted
  }, [receipts, timelineRange, now])

  const distinctServices = useMemo(
    () => new Set(receipts.map((r) => r.service_name)).size,
    [receipts]
  )

  const longRetentionCount = useMemo(
    () => receipts.filter((r) => r.retention_days && r.retention_days >= 365).length,
    [receipts]
  )

  const unclearRevokeCount = useMemo(
    () => receipts.filter((r) => !r.revoke_path || r.revoke_path.includes('Needs')).length,
    [receipts]
  )

  const thirdPartyCount = useMemo(
    () => new Set(receipts.flatMap((r) => r.third_party_services || [])).size,
    [receipts]
  )

  const riskScore = useMemo(() => {
    const highSignals = receipts.filter(
      (r) => r.retention_days >= 365 || (r.third_party_services?.length ?? 0) > 0
    ).length
    const base = 30
    const score =
      base +
      highSignals * 12 +
      unclearRevokeCount * 8 +
      Math.min(30, distinctServices * 2) +
      Math.min(10, thirdPartyCount * 2)
    return Math.min(100, score)
  }, [receipts, unclearRevokeCount, distinctServices, thirdPartyCount])

  const overloadLevel = useMemo(() => {
    if (distinctServices >= 10) return { label: '높음', color: 'bg-rose-500', tone: 'text-white' }
    if (distinctServices >= 6) return { label: '보통', color: 'bg-amber-300', tone: 'text-slate-800' }
    return { label: '낮음', color: 'bg-emerald-100', tone: 'text-emerald-800' }
  }, [distinctServices])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    receipts.forEach((r) => {
      const key = r.category || '기타'
      counts[key] = (counts[key] ?? 0) + 1
    })
    return counts
  }, [receipts])

  const requestStatusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    requests.forEach((req) => {
      counts[req.status] = (counts[req.status] ?? 0) + 1
    })
    return counts
  }, [requests])

  const totalRequests = requests.length

  const nextActions = useMemo(() => {
    const actions: string[] = []
    if (riskScore >= 70) actions.push('리스크 점수가 높습니다. 보관기간이 긴 항목은 우선 철회/삭제 요청서를 만드세요.')
    if (unclearRevokeCount > 0) actions.push('철회 경로가 불명확한 문서가 있습니다. 안내 이메일 주소나 고객센터 링크를 메모로 남기세요.')
    if (longRetentionCount > 0) actions.push('보관기간이 1년 이상인 문서가 있습니다. 최소 보관근거 재요청을 권장합니다.')
    if (totalRequests > 0 && (requestStatusCounts.WAITING || 0) > 0)
      actions.push('대기 중인 요청이 있습니다. 수신 확인 메일이 왔는지 체크하고 필요하면 추가 자료를 보내세요.')
    if (actions.length === 0) actions.push('모든 상태가 양호합니다. 새로 수집된 동의 문서가 생기면 여기에서 바로 확인하세요.')
    return actions.slice(0, 3)
  }, [riskScore, unclearRevokeCount, longRetentionCount, totalRequests, requestStatusCounts])

  return (
    <main className="min-h-screen bg-[#f6f1e8]">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-[#8b6b53] uppercase tracking-[0.12em]">
              <Shield className="h-4 w-4" /> 개인정보 보호 현황
            </p>
            <h1 className="text-5xl font-bold text-[#1b1410] leading-tight">
              대시보드 요약
            </h1>
            <p className="mt-3 text-lg text-[#2d241f] leading-relaxed">
              수집된 동의/약관 문서를 기반으로 위험 신호를 집계하고, 철회·삭제 요청 진행 상황을 한눈에 보여줍니다.
            </p>
          </div>
          <button
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-2 rounded-xl border-2 border-[#2d241f] bg-white px-4 py-3 text-sm font-bold text-[#1b1410] transition hover:bg-[#fff4e6]"
          >
            <HelpCircle className="h-5 w-5" />
            가이드 보기
          </button>
        </header>

        {/* 핵심 지표 */}
        <section className="grid gap-6 md:grid-cols-3">
          <KeyStatCard
            title="리스크 점수"
            value={`${riskScore} / 100`}
            tone={riskScore >= 70 ? 'text-rose-600' : riskScore >= 50 ? 'text-amber-700' : 'text-emerald-700'}
            hint="보관기간·제3자 제공·철회 경로 불명 등 신호를 가중합한 지표입니다."
            icon={<AlertTriangle className="h-6 w-6 text-sky-600" strokeWidth={2.5} />}
            barValue={riskScore}
          />
          <KeyStatCard
            title="동의 대상 개수"
            value={`${distinctServices}곳`}
            tone={overloadLevel.tone}
            hint="최근 확보된 서비스/기관 수가 많을수록 관리가 필요합니다."
            badge={overloadLevel.label}
            barValue={Math.min(100, distinctServices * 10)}
            barColor={overloadLevel.color}
            icon={<TrendingUp className="h-6 w-6 text-sky-600" strokeWidth={2.5} />}
          />
          <KeyStatCard
            title="철회·삭제 요청 진행"
            value={`${totalRequests}건`}
            tone="text-slate-900"
            hint="전송/대기/완료/거절 상태를 합산해 보여줍니다."
            customBar={<StatusStack counts={requestStatusCounts} total={totalRequests} />}
            icon={<Mail className="h-6 w-6 text-sky-600" strokeWidth={2.5} />}
          />
        </section>

        {/* 추이 & 카테고리 */}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border-4 border-[#2d241f] bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-7 w-7 text-[#de3f1c]" strokeWidth={2.5} />
                <div>
                  <h2 className="text-2xl font-bold text-[#1b1410]">동의 추이 (월별)</h2>
                  <p className="text-sm text-[#5c4c41]">최근 몇 달 동안 수집된 동의 문서 건수를 막대로 확인하세요.</p>
                </div>
              </div>
              <div className="flex gap-2">
                {(['3m', '6m', 'all'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimelineRange(range)}
                    className={`rounded-lg border-2 px-3 py-1 text-sm font-bold transition ${
                      timelineRange === range
                        ? 'border-sky-700 bg-sky-700 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {range === '3m' ? '최근 3개월' : range === '6m' ? '최근 6개월' : '전체'}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-end gap-3 overflow-x-auto pb-2">
              {timelineBuckets.length === 0 && (
                <p className="text-base text-[#6b5a4b]">표시할 데이터가 없습니다.</p>
              )}
              {timelineBuckets.map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-2">
                  <div
                    className="w-12 rounded-lg bg-gradient-to-t from-[#de3f1c] via-[#ffb347] to-[#ffe0cc] shadow-sm"
                    style={{ height: Math.max(10, item.count * 16) }}
                    title={`${item.label}: ${item.count}건`}
                  />
                  <span className="text-xs font-semibold text-[#2d241f]">{item.label}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-[#5c4c41]">
              특정 월에 급증한 경우 해당 일자의 상세 문서를 열어보고 필요 시 철회·삭제 요청을 이어서 작성하세요.
            </p>
          </div>

          <div className="rounded-2xl border-4 border-[#2d241f] bg-white p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="h-7 w-7 text-[#de3f1c]" strokeWidth={2.5} />
              <div>
                <h2 className="text-2xl font-bold text-[#1b1410]">카테고리 분포</h2>
                <p className="text-sm text-[#5c4c41]">어떤 분야에서 동의가 많이 발생했는지 확인</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {Object.entries(categoryCounts).map(([cat, count]) => (
                <span
                  key={cat}
                  className="flex items-center gap-2 rounded-full border-2 border-[#2d241f] bg-[#fffaf4] px-4 py-2 text-sm font-bold text-[#1b1410]"
                >
                  {cat} <span className="text-[#de3f1c]">{count}건</span>
                </span>
              ))}
              {Object.keys(categoryCounts).length === 0 && (
                <p className="text-sm text-[#6b5a4b]">분류된 문서가 없습니다.</p>
              )}
            </div>
            <div className="mt-4 rounded-xl border-2 border-dashed border-[#e4d4c3] bg-[#fffaf4] p-3 text-sm text-[#5c4c41]">
              금융·의료·결제 등 민감 분야라면 철회/삭제 요청 경로를 함께 기록해 두세요.
            </div>
          </div>
        </section>

        {/* 요청 진행 현황 */}
        <section className="rounded-2xl border-4 border-[#2d241f] bg-white p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="h-7 w-7 text-[#de3f1c]" strokeWidth={2.5} />
            <div>
              <h2 className="text-2xl font-bold text-[#1b1410]">철회/삭제 요청 진행상황</h2>
              <p className="text-sm text-[#5c4c41]">
                전송·대기·완료·거절 상태 비율을 확인하고, 필요한 경우 추가 자료를 보완하세요.
              </p>
            </div>
          </div>
          <StatusStack counts={requestStatusCounts} total={totalRequests} large />
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {requests.slice(0, 3).map((req) => (
              <div key={req.id} className="rounded-xl border-2 border-[#2d241f] bg-[#fffaf4] p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[#8b6b53] uppercase tracking-[0.08em]">
                      {req.entity_name}
                    </p>
                    <h3 className="text-lg font-bold text-[#1b1410]">{req.service_name}</h3>
                    <p className="text-sm text-[#5c4c41]">{req.request_type}</p>
                  </div>
                  <span className="rounded-full bg-[#2d241f] px-3 py-1 text-xs font-bold text-white">
                    {statusLabels[req.status] ?? req.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-[#2d241f]">
                  작성 {new Date(req.created_at).toLocaleDateString('ko-KR')}
                  {req.updated_at && ` · 업데이트 ${new Date(req.updated_at).toLocaleDateString('ko-KR')}`}
                </p>
              </div>
            ))}
            {requests.length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-[#e4d4c3] bg-[#fffaf4] p-4 text-sm text-[#5c4c41]">
                아직 생성된 요청이 없습니다. 필요한 동의서를 선택해 첫 요청을 만들어 보세요.
              </div>
            )}
          </div>
        </section>

        {/* 문서 목록 */}
        <section className="rounded-2xl border-4 border-[#2d241f] bg-white p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-7 w-7 text-[#de3f1c]" strokeWidth={2.5} />
            <div>
              <h2 className="text-2xl font-bold text-[#1b1410]">최근 업로드 문서</h2>
              <p className="text-sm text-[#5c4c41]">문서 유형, 수신일, 위험도를 함께 확인하세요.</p>
            </div>
          </div>

          {documents.length === 0 && (
            <div className="rounded-xl border-2 border-[#e4d4c3] bg-[#fffaf4] p-6 text-lg text-[#2d241f]">
              아직 업로드된 문서가 없습니다.
            </div>
          )}
          <div className="grid gap-6 md:grid-cols-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="group rounded-xl border-2 border-[#2d241f] bg-[#fffaf4] p-6 transition hover:bg-white hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-bold uppercase text-[#8b6b53] mb-1">
                      {doc.entity_name}
                    </p>
                    <h3 className="text-xl font-bold text-[#1b1410]">{doc.title}</h3>
                  </div>
                  <span
                    className={`rounded-full border-2 px-4 py-2 text-sm font-bold whitespace-nowrap ${riskStyleMap[doc.risk_level as RiskStyle]}`}
                  >
                    {doc.risk_level === 'LOW' ? '낮음' : doc.risk_level === 'MED' ? '중간' : '높음'}
                  </span>
                </div>
                <div className="mb-3 flex flex-wrap gap-3">
                  <span className="rounded-lg border-2 border-[#2d241f] bg-white px-3 py-1 text-sm font-bold text-[#1b1410]">
                    {docTypeLabelMap[doc.doc_type]}
                  </span>
                  <span className="rounded-lg border-2 border-[#2d241f] bg-white px-3 py-1 text-sm font-bold text-[#1b1410]">
                    {new Date(doc.received_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <p className="mb-4 text-sm text-[#2d241f] leading-relaxed">{doc.summary_line}</p>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/receipt/${doc.id}`}
                    className="rounded-xl bg-[#de3f1c] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#b23b1e] min-h-[42px] flex items-center"
                  >
                    상세 보기
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(doc.id)}
                    className="rounded-xl bg-[#ffe0cc] p-3 text-[#b23b1e] transition hover:bg-[#f1b59f] min-h-[42px] min-w-[42px] flex items-center justify-center"
                    title="삭제"
                  >
                    <X className="h-5 w-5" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 다음 추천 액션 */}
        <section className="rounded-2xl border-4 border-[#2d241f] bg-white p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="h-7 w-7 text-[#de3f1c]" strokeWidth={2.5} />
            <div>
              <h2 className="text-2xl font-bold text-[#1b1410]">다음으로 할 일</h2>
              <p className="text-sm text-[#5c4c41]">리스크 신호와 진행 상태를 기준으로 추천합니다.</p>
            </div>
          </div>
          <ul className="space-y-2">
            {nextActions.map((action, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 rounded-xl border-2 border-[#2d241f] bg-[#fffaf4] px-4 py-3 text-sm text-[#2d241f]"
              >
                <span className="mt-1 h-2 w-2 rounded-full bg-[#de3f1c]" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl border-2 border-[#2d241f] bg-white px-4 py-3 text-sm font-bold text-[#de3f1c] transition hover:bg-[#fff4e6]"
          >
            <Home className="h-5 w-5" /> 홈으로 돌아가기
          </Link>
          <Link
            href="/revocation"
            className="flex items-center gap-2 rounded-xl border-2 border-[#2d241f] bg-[#de3f1c] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#b23b1e]"
          >
            <FileText className="h-5 w-5" /> 철회/삭제 요청 만들기
          </Link>
        </div>
      </div>

      {/* ??젣 ?뺤씤 紐⑤떖 */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-2xl border-4 border-[#2d241f] bg-white p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#1b1410]">문서 삭제</h3>
              <button
                onClick={handleDeleteCancel}
                className="rounded-xl p-2 text-[#2d241f] transition hover:bg-[#fffaf4] min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="h-6 w-6" strokeWidth={2.5} />
              </button>
            </div>
            <p className="text-base text-[#2d241f] mb-6 leading-relaxed">
              삭제하면 해당 문서와 연결된 요청 기록도 함께 정리됩니다. 계속하시겠어요?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 rounded-xl border-2 border-[#2d241f] bg-white px-6 py-3 text-sm font-bold text-[#1b1410] transition hover:bg-[#fffaf4]"
              >
                취소
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 rounded-xl bg-[#b23b1e] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#9a3219]"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 가이드 모달 */}
      {showGuide && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-3xl rounded-2xl border-4 border-[#2d241f] bg-white p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#8b6b53] uppercase tracking-[0.12em]">빠른 안내</p>
                <h3 className="text-2xl font-bold text-[#1b1410]">대시보드 사용법</h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="rounded-xl p-2 text-[#2d241f] transition hover:bg-[#fffaf4]"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <ol className="space-y-3 text-sm text-[#2d241f]">
              <li>
                <span className="font-bold text-[#1b1410]">1) 리스크 영역</span>에서 점수가 높으면 해당 월/카테고리를 눌러 자세히 확인하세요.
              </li>
              <li>
                <span className="font-bold text-[#1b1410]">2) 요청 진행</span> 카드에서 대기 중인 요청을 확인하고 증빙을 추가할 수 있습니다.
              </li>
              <li>
                <span className="font-bold text-[#1b1410]">3) 문서 상세</span>를 열면 철회·삭제 요청서를 바로 생성할 수 있습니다.
              </li>
              <li>
                <span className="font-bold text-[#1b1410]">4) 다음 액션</span> 목록을 따라가면 우선순위 대응이 쉬워집니다.
              </li>
            </ol>
            <div className="flex items-center gap-3 rounded-xl border-2 border-[#e4d4c3] bg-[#fffaf4] p-4 text-sm text-[#2d241f]">
              <Clock4 className="h-5 w-5 text-[#de3f1c]" />
              <p>
                화면 오른쪽 상단의 도움말 버튼에서 언제든 다시 볼 수 있습니다. 처음 사용자라면 체크 포인트를 모두 읽어주세요.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

type KeyStatCardProps = {
  title: string
  value: string
  tone: string
  hint: string
  icon: ReactNode
  badge?: string
  barValue?: number
  barColor?: string
  customBar?: ReactNode
}

function KeyStatCard({
  title,
  value,
  tone,
  hint,
  icon,
  badge,
  barValue,
  barColor,
  customBar,
}: KeyStatCardProps) {
  return (
    <div className="rounded-2xl border-4 border-[#2d241f] bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#fff4e6] p-3">{icon}</div>
          <div>
            <p className="text-sm font-bold text-[#8b6b53]">{title}</p>
            <p className={`text-3xl font-extrabold ${tone}`}>{value}</p>
          </div>
        </div>
        {badge && (
          <span className="rounded-full bg-[#2d241f] px-3 py-1 text-xs font-bold text-white">
            {badge}
          </span>
        )}
      </div>
      <p className="mt-3 text-sm text-[#5c4c41]">{hint}</p>
      <div className="mt-4">
        {customBar ? (
          customBar
        ) : (
          <div className="h-3 w-full overflow-hidden rounded-full border-2 border-[#2d241f] bg-[#fffaf4]">
            <div
              className="h-full bg-gradient-to-r from-[#de3f1c] via-[#ffb347] to-[#ffe0cc]"
              style={{ width: `${Math.min(100, barValue ?? 0)}%`, backgroundColor: barColor }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function StatusStack({
  counts,
  total,
  large = false,
}: {
  counts: Record<string, number>
  total: number
  large?: boolean
}) {
  const palette: Record<string, string> = {
    SENT: '#4b9ce2',
    WAITING: '#ffb347',
    DONE: '#62c37b',
    REJECTED: '#de3f1c',
    DRAFT: '#9aa5b1',
    NEED_MORE_INFO: '#ffa94d',
  }

  const order = ['SENT', 'WAITING', 'DONE', 'NEED_MORE_INFO', 'REJECTED', 'DRAFT']

  return (
    <div className="space-y-2">
      <div
        className={`flex w-full overflow-hidden rounded-full border-2 border-[#2d241f] bg-[#fffaf4] ${
          large ? 'h-4' : 'h-3'
        }`}
      >
        {order.map((key) => {
          const count = counts[key] ?? 0
          if (count === 0 || total === 0) return null
          return (
            <div
              key={key}
              className="h-full"
              style={{ width: `${(count / total) * 100}%`, backgroundColor: palette[key] }}
              title={`${statusLabels[key] ?? key}: ${count}건`}
            />
          )
        })}
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-[#2d241f]">
        {order.map((key) => {
          const count = counts[key] ?? 0
          if (count === 0 && total > 0) return null
          return (
            <span key={key} className="flex items-center gap-1 rounded-full bg-[#fffaf4] px-2 py-1 border border-[#e4d4c3]">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: palette[key] }} />
              {statusLabels[key] ?? key} {total > 0 ? `${count}건` : '0건'}
            </span>
          )
        })}
      </div>
    </div>
  )
}









