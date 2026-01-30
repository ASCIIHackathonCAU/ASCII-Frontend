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
  LOW: 'border-[#b7d6c6] bg-[#e6f6ee] text-[#1e5b3a]',
  MED: 'border-[#f1c7a8] bg-[#ffe8d5] text-[#8a4a1f]',
  HIGH: 'border-[#f1b59f] bg-[#ffe0cc] text-[#b23b1e]',
}

const statusLabels: Record<string, string> = {
  DRAFT: '작성 중',
  SENT: '발송됨',
  WAITING: '대기 중',
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
    if (distinctServices >= 10) return { label: '높음', color: 'bg-[#de3f1c]', tone: 'text-white' }
    if (distinctServices >= 6) return { label: '중간', color: 'bg-[#ffb347]', tone: 'text-[#2d241f]' }
    return { label: '낮음', color: 'bg-[#b7d6c6]', tone: 'text-[#1e5b3a]' }
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
    if (riskScore >= 70) actions.push('위험 지수가 높아요. 보관 기간이 긴 서비스부터 철회·삭제 요청을 보내세요.')
    if (unclearRevokeCount > 0) actions.push('철회 경로가 불분명한 문서를 정리하고 요청 경로를 기록해 두세요.')
    if (longRetentionCount > 0) actions.push('보관 기간 1년 이상 서비스의 설정을 다시 확인하세요.')
    if (totalRequests > 0 && (requestStatusCounts.WAITING || 0) > 0)
      actions.push('대기 중인 요청에 후속 문의 메일을 보내면 처리 속도가 빨라집니다.')
    if (actions.length === 0) actions.push('모든 지표가 안정적입니다. 신규 동의 발생 시 이 화면에서 바로 확인하세요.')
    return actions.slice(0, 3)
  }, [riskScore, unclearRevokeCount, longRetentionCount, totalRequests, requestStatusCounts])

  return (
    <main className="min-h-screen bg-[#f6f1e8]">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-[#8b6b53] uppercase tracking-[0.12em]">
              <Shield className="h-4 w-4" /> 개인정보 안전 패널
            </p>
            <h1 className="text-5xl font-bold text-[#1b1410] leading-tight">
              통계 보기 대시보드
            </h1>
            <p className="mt-3 text-lg text-[#2d241f] leading-relaxed">
              동의·정책 영수증과 철회/삭제 요청 진행 상황을 한눈에 모아 위험 신호를 빠르게 잡아냅니다.
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

        {/* 핵심 지표 카드 */}
        <section className="grid gap-6 md:grid-cols-3">
          <KeyStatCard
            title="개인정보 위험 지수"
            value={`${riskScore} / 100`}
            tone={riskScore >= 70 ? 'text-[#b23b1e]' : riskScore >= 50 ? 'text-[#8a4a1f]' : 'text-[#1e5b3a]'}
            hint="보관 기간·3자 제공·철회 경로 불명 요소를 종합한 지표"
            icon={<AlertTriangle className="h-6 w-6 text-[#de3f1c]" strokeWidth={2.5} />}
            barValue={riskScore}
          />
          <KeyStatCard
            title="정보 과부하 지표"
            value={`${distinctServices}개 서비스`}
            tone={overloadLevel.tone}
            hint="최근 동의/정책 문서를 받은 서비스 개수 기준"
            badge={overloadLevel.label}
            barValue={Math.min(100, distinctServices * 10)}
            barColor={overloadLevel.color}
            icon={<TrendingUp className="h-6 w-6 text-[#de3f1c]" strokeWidth={2.5} />}
          />
          <KeyStatCard
            title="철회·삭제 요청 현황"
            value={`${totalRequests}건`}
            tone="text-[#1b1410]"
            hint="발송/대기/완료/거절 비율을 색으로 표시"
            customBar={
              <StatusStack counts={requestStatusCounts} total={totalRequests} />
            }
            icon={<Mail className="h-6 w-6 text-[#de3f1c]" strokeWidth={2.5} />}
          />
        </section>

        {/* 타임라인 & 카테고리 */}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border-4 border-[#2d241f] bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-7 w-7 text-[#de3f1c]" strokeWidth={2.5} />
                <div>
                  <h2 className="text-2xl font-bold text-[#1b1410]">동의 타임라인</h2>
                  <p className="text-sm text-[#5c4c41]">언제 동의가 집중됐는지 막대 길이로 확인하세요.</p>
                </div>
              </div>
              <div className="flex gap-2">
                {(['3m', '6m', 'all'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimelineRange(range)}
                    className={`rounded-lg border-2 border-[#2d241f] px-3 py-1 text-sm font-bold ${
                      timelineRange === range ? 'bg-[#2d241f] text-white' : 'bg-white text-[#2d241f]'
                    }`}
                  >
                    {range === '3m' ? '최근 3개월' : range === '6m' ? '최근 6개월' : '전체'}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-end gap-3 overflow-x-auto pb-2">
              {timelineBuckets.length === 0 && (
                <p className="text-base text-[#6b5a4b]">표시할 데이터가 아직 없습니다.</p>
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
              그래프를 통해 특정 달에 동의가 몰렸다면 해당 서비스 목록을 살펴보고 필요 시 철회 요청을 준비하세요.
            </p>
          </div>

          <div className="rounded-2xl border-4 border-[#2d241f] bg-white p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="h-7 w-7 text-[#de3f1c]" strokeWidth={2.5} />
              <div>
                <h2 className="text-2xl font-bold text-[#1b1410]">카테고리 분포</h2>
                <p className="text-sm text-[#5c4c41]">어떤 분야에서 동의가 많은지 확인</p>
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
              특정 분야(예: 헬스케어, 결제)에서 동의가 잦다면 그 서비스들의 철회 경로를 먼저 확보해 두세요.
            </div>
          </div>
        </section>

        {/* 요청 진행 현황 */}
        <section className="rounded-2xl border-4 border-[#2d241f] bg-white p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="h-7 w-7 text-[#de3f1c]" strokeWidth={2.5} />
            <div>
              <h2 className="text-2xl font-bold text-[#1b1410]">철회/삭제 요청 진행 한눈에</h2>
              <p className="text-sm text-[#5c4c41]">
                발송 → 대기 → 완료 → 거절 단계를 색으로 표시하고, 늦어진 단계에 바로 후속 조치를 하도록 안내합니다.
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
                  생성 {new Date(req.created_at).toLocaleDateString('ko-KR')}
                  {req.updated_at && ` · 업데이트 ${new Date(req.updated_at).toLocaleDateString('ko-KR')}`}
                </p>
              </div>
            ))}
            {requests.length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-[#e4d4c3] bg-[#fffaf4] p-4 text-sm text-[#5c4c41]">
                아직 요청을 만들지 않았습니다. 위험도가 높은 서비스부터 철회 요청을 만들어보세요.
              </div>
            )}
          </div>
        </section>

        {/* 문서 목록 */}
        <section className="rounded-2xl border-4 border-[#2d241f] bg-white p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-7 w-7 text-[#de3f1c]" strokeWidth={2.5} />
            <div>
              <h2 className="text-2xl font-bold text-[#1b1410]">최근 받은 영수증</h2>
              <p className="text-sm text-[#5c4c41]">
                문서 종류, 수신 일자, 위험도 정보를 함께 보여줍니다.
              </p>
            </div>
          </div>

          {documents.length === 0 && (
            <div className="rounded-xl border-2 border-[#e4d4c3] bg-[#fffaf4] p-6 text-lg text-[#2d241f]">
              저장된 영수증이 없습니다.
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
                    {doc.risk_level === 'LOW' ? '낮음' : doc.risk_level === 'MED' ? '보통' : '높음'}
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

        {/* 다음 행동 추천 */}
        <section className="rounded-2xl border-4 border-[#2d241f] bg-white p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="h-7 w-7 text-[#de3f1c]" strokeWidth={2.5} />
            <div>
              <h2 className="text-2xl font-bold text-[#1b1410]">바로 할 수 있는 다음 조치</h2>
              <p className="text-sm text-[#5c4c41]">위험 신호와 진행 상태를 기반으로 한 맞춤 권장 행동</p>
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

      {/* 삭제 확인 모달 */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-2xl border-4 border-[#2d241f] bg-white p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#1b1410]">영수증 삭제</h3>
              <button
                onClick={handleDeleteCancel}
                className="rounded-xl p-2 text-[#2d241f] transition hover:bg-[#fffaf4] min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="h-6 w-6" strokeWidth={2.5} />
              </button>
            </div>
            <p className="text-base text-[#2d241f] mb-6 leading-relaxed">
              이 영수증을 삭제할까요? 삭제해도 기존에 만든 요청 기록은 그대로 유지됩니다.
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
                <span className="font-bold text-[#1b1410]">① 위험도 지수</span>에서 빨간색이 보이면 어떤
                문서가 위험 요인인지 클릭해 확인하세요.
              </li>
              <li>
                <span className="font-bold text-[#1b1410]">② 타임라인</span>에서 동의가 몰린 달을 눌러 해당
                서비스의 철회 경로를 점검하세요.
              </li>
              <li>
                <span className="font-bold text-[#1b1410]">③ 요청 진행</span> 막대에서 회색/노란 구간이 크면
                후속 메일을 보내거나 추가 서류를 준비하세요.
              </li>
              <li>
                <span className="font-bold text-[#1b1410]">④ 다음 조치</span>의 체크리스트를 따라 순서대로 처리하면
                과부하 없이 관리할 수 있습니다.
              </li>
            </ol>
            <div className="flex items-center gap-3 rounded-xl border-2 border-[#e4d4c3] bg-[#fffaf4] p-4 text-sm text-[#2d241f]">
              <Clock4 className="h-5 w-5 text-[#de3f1c]" />
              <p>
                화면 우측 상단의 가이드 버튼에서 언제든 이 도움말을 다시 열 수 있습니다. 처음 사용자도 단계별로
                따라올 수 있도록 간결한 언어와 시각적 강조를 유지했습니다.
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
