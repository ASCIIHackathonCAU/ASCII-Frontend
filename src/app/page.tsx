'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  Upload,
  BarChart3,
  BookOpen,
  Shield,
  FileText,
  Info,
  Mail,
  TrendingUp,
  AlertTriangle,
  Clock4,
  CheckCircle2,
} from 'lucide-react'
import { listReceipts } from '@/lib/receiptClient'
import { listRevocationRequests, type RevocationRequest } from '@/lib/api/revocationApi'
import { type Receipt } from '@/lib/receiptTypes'

const cardClass =
  'group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(15,23,42,0.12)]'

const iconWrap = 'rounded-xl bg-gradient-to-br from-sky-100 via-indigo-50 to-white p-4 shadow-inner'
const accent = 'text-sky-600'

export default function Home() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [requests, setRequests] = useState<RevocationRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [receiptList, requestList] = await Promise.all([
          listReceipts().catch(() => []),
          listRevocationRequests().catch(() => []),
        ])

        setReceipts(Array.isArray(receiptList) ? receiptList : [])
        setRequests(Array.isArray(requestList) ? requestList : [])
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [])

  const timelineBuckets = useMemo(() => {
    const counts: Record<string, number> = {}
    receipts.forEach((r) => {
      if (!r.received_at) return
      const label = r.received_at.slice(0, 7) // YYYY-MM
      counts[label] = (counts[label] ?? 0) + 1
    })
    return Object.entries(counts)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([label, count]) => ({ label, count }))
  }, [receipts])

  const latestBucket = timelineBuckets[timelineBuckets.length - 1] ?? null
  const prevBucket = timelineBuckets.length > 1 ? timelineBuckets[timelineBuckets.length - 2] : null
  const monthDelta = latestBucket && prevBucket ? latestBucket.count - prevBucket.count : latestBucket?.count ?? 0
  const monthDeltaPct =
    prevBucket && prevBucket.count > 0 ? Math.round((monthDelta / prevBucket.count) * 100) : null

  const distinctServices = useMemo(
    () => new Set(receipts.map((r) => r.service_name)).size,
    [receipts]
  )

  const longRetentionCount = useMemo(
    () => receipts.filter((r) => (r.retention_days ?? 0) >= 365).length,
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
      (r) => (r.retention_days ?? 0) >= 365 || (r.third_party_services?.length ?? 0) > 0
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

  const requestStatusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    requests.forEach((req) => {
      counts[req.status] = (counts[req.status] ?? 0) + 1
    })
    return counts
  }, [requests])

  const totalRequests = requests.length
  const waitingCount = requestStatusCounts.WAITING ?? 0
  const doneCount = requestStatusCounts.DONE ?? 0
  const requestProgress = totalRequests > 0 ? Math.round((doneCount / totalRequests) * 100) : 0

  const nextActions = useMemo(() => {
    const actions: string[] = []
    if (riskScore >= 70) actions.push('리스크 점수가 높습니다. 보관기간이 긴 항목부터 철회/삭제 요청서를 만드세요.')
    if (unclearRevokeCount > 0) actions.push('철회 경로가 불명확한 문서가 있습니다. 고객센터나 이메일 주소를 메모로 남겨두세요.')
    if (longRetentionCount > 0) actions.push('보관기간이 1년 이상인 문서가 있습니다. 최소 보관 근거 확인을 권장합니다.')
    if (totalRequests > 0 && waitingCount > 0)
      actions.push('대기 중인 요청이 있습니다. 수신 확인 메일이 왔는지 확인하고 필요하면 증빙을 추가하세요.')
    if (actions.length === 0) actions.push('모든 상태가 양호합니다. 새로 들어온 동의 문서를 바로 요약 카드에서 확인하세요.')
    return actions.slice(0, 3)
  }, [riskScore, unclearRevokeCount, longRetentionCount, totalRequests, waitingCount])

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12">
        <header className="flex flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Consent Fabric</p>
          <h1 className="text-5xl font-semibold leading-tight text-slate-900">
            동의 문서 관리 허브
          </h1>
          <p className="max-w-4xl text-lg leading-relaxed text-slate-600">
            흩어진 동의 문서를 한곳에 모으고 템플릿·자동 분류로 개인정보 권리 행사를 빠르게 돕습니다.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.35fr,0.9fr]">
          <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-[0_18px_48px_rgba(15,23,42,0.12)] backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">현황 대시보드 스냅샷</p>
                <h2 className="text-2xl font-semibold text-slate-900">main에서 바로 보는 핵심 수치</h2>
                <p className="text-sm text-slate-600">수집·위험·요청 진행 상황을 한눈에 확인하세요.</p>
              </div>
              <Link
                href="/dashboard"
                className="rounded-full border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                대시보드 전체 보기
              </Link>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <SnapshotCard
                label="리스크 점수"
                value={loading ? '—' : `${riskScore} / 100`}
                hint={`장기 보관 ${longRetentionCount}건 · 제3자 ${thirdPartyCount}곳`}
                barValue={riskScore}
                icon={<AlertTriangle className="h-5 w-5 text-amber-600" strokeWidth={2.4} />}
              />
              <SnapshotCard
                label="수집 문서"
                value={loading ? '—' : `${receipts.length.toLocaleString()}건`}
                hint={`최근 ${latestBucket?.label ?? '—'}: ${latestBucket?.count ?? 0}건`}
                barValue={Math.min(100, (latestBucket?.count ?? 0) * 12)}
                icon={<TrendingUp className="h-5 w-5 text-sky-600" strokeWidth={2.4} />}
                delta={monthDeltaPct}
              />
              <SnapshotCard
                label="요청 진행"
                value={loading ? '—' : `${waitingCount}건 대기`}
                hint={totalRequests > 0 ? `완료 ${doneCount}건 / 전체 ${totalRequests}건` : '아직 생성된 요청이 없습니다'}
                barValue={requestProgress}
                icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" strokeWidth={2.4} />}
              >
                <StatusStack counts={requestStatusCounts} total={totalRequests} />
              </SnapshotCard>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Clock4 className="h-4 w-4 text-slate-500" /> 최근 추세
                </div>
                <div className="flex items-baseline gap-3 text-2xl font-semibold text-slate-900">
                  <span>{latestBucket ? `${latestBucket.count}건` : '—'}</span>
                  <span className={`text-sm font-semibold ${monthDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {monthDelta >= 0 ? '▲' : '▼'} {Math.abs(monthDelta)}건
                    {monthDeltaPct !== null && ` (${monthDeltaPct >= 0 ? '+' : ''}${monthDeltaPct}%)`}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{latestBucket ? `${latestBucket.label} 기준` : '데이터 불러오는 중'}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-white px-2 py-1 font-semibold text-slate-700">
                    서비스 {distinctServices}개
                  </span>
                  <span className="rounded-full bg-white px-2 py-1 font-semibold text-slate-700">
                    철회 경로 미확인 {unclearRevokeCount}건
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Shield className="h-4 w-4 text-sky-600" /> 우선 대응
                  </div>
                  <Link href="/revocation" className="text-xs font-semibold text-sky-600 underline">
                    요청 만들기
                  </Link>
                </div>
                <ul className="space-y-2 text-sm text-slate-700">
                  {nextActions.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-0.5 h-2 w-2 rounded-full bg-sky-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 p-6 text-white shadow-[0_18px_48px_rgba(15,23,42,0.16)]">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-sky-200" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-200">Inbox + Requests</p>
                <h3 className="text-xl font-semibold">현재 메일/요청 상태</h3>
              </div>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-100">
              <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                <span>총 동의 문서</span>
                <span className="text-lg font-bold">{loading ? '—' : `${receipts.length}건`}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                <span>요청 진행률</span>
                <span className="text-lg font-bold">{loading ? '—' : `${requestProgress}%`}</span>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-4">
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-sky-100">
                  <BarChart3 className="h-4 w-4" /> 상태 분포
                </p>
                <StatusStack counts={requestStatusCounts} total={totalRequests} compact />
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-sky-500/90 px-4 py-3 text-sm font-semibold shadow-inner">
                <span>리스크 모니터</span>
                <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> {riskScore}점</span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-8 md:grid-cols-2">
          <Link href="/ingest" className={cardClass}>
            <div className="mb-6 flex items-center gap-4">
              <div className={iconWrap}>
                <Upload className={`h-10 w-10 ${accent}`} strokeWidth={2.4} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Step 1</p>
                <h2 className="text-3xl font-semibold text-slate-900">문서 수집하기</h2>
              </div>
            </div>
            <p className="mb-4 text-base leading-relaxed text-slate-600">동의·약관·수신 동의 메일을 가져와 보관합니다.</p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className={`${accent} font-bold`}>•</span>
                <span>이메일 연동 또는 파일 업로드</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={`${accent} font-bold`}>•</span>
                <span>스캔 PDF도 텍스트 추출</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={`${accent} font-bold`}>•</span>
                <span>핵심 요약 자동 생성</span>
              </li>
            </ul>
          </Link>

          <Link href="/consent-dashboard" className={cardClass}>
            <div className="mb-6 flex items-center gap-4">
              <div className={iconWrap}>
                <Mail className={`h-10 w-10 ${accent}`} strokeWidth={2.4} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Step 2</p>
                <h2 className="text-3xl font-semibold text-slate-900">동의 인박스 분류</h2>
              </div>
            </div>
            <p className="mb-4 text-base leading-relaxed text-slate-600">Gmail·Outlook API 연동으로 동의 메일을 자동 분류합니다.</p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className={`${accent} font-bold`}>•</span>
                <span>메일 API 연동 (Gmail/Outlook)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={`${accent} font-bold`}>•</span>
                <span>동의 메일 자동 라우팅</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={`${accent} font-bold`}>•</span>
                <span>위험 신호 요약 표시</span>
              </li>
            </ul>
          </Link>

          <Link href="/revocation" className={cardClass}>
            <div className="mb-6 flex items-center gap-4">
              <div className={iconWrap}>
                <FileText className={`h-10 w-10 ${accent}`} strokeWidth={2.4} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Step 3</p>
                <h2 className="text-3xl font-semibold text-slate-900">철회·삭제 요청</h2>
              </div>
            </div>
            <p className="mb-4 text-base leading-relaxed text-slate-600">개인정보 삭제, 동의 철회, 제3자 제공 중단을 한 번에 작성합니다.</p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className={`${accent} font-bold`}>•</span>
                <span>요청서 템플릿 자동 채움</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={`${accent} font-bold`}>•</span>
                <span>기관별 제출 경로 안내</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={`${accent} font-bold`}>•</span>
                <span>진행 상태 추적</span>
              </li>
            </ul>
          </Link>

          <Link href="/dashboard" className={cardClass}>
            <div className="mb-6 flex items-center gap-4">
              <div className={iconWrap}>
                <BarChart3 className={`h-10 w-10 ${accent}`} strokeWidth={2.4} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Step 4</p>
                <h2 className="text-3xl font-semibold text-slate-900">현황 대시보드</h2>
              </div>
            </div>
            <p className="mb-4 text-base leading-relaxed text-slate-600">동의 추세와 위험도를 한눈에 확인합니다.</p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className={`${accent} font-bold`}>•</span>
                <span>월별 수집 문서 추이</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={`${accent} font-bold`}>•</span>
                <span>분야·서비스별 위험도</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={`${accent} font-bold`}>•</span>
                <span>요청 진행률 모니터링</span>
              </li>
            </ul>
          </Link>
        </div>

        <Link href="/inbox" className={`${cardClass} md:col-span-2`}>
          <div className="mb-6 flex items-center gap-4">
            <div className={iconWrap}>
              <BookOpen className={`h-10 w-10 ${accent}`} strokeWidth={2.4} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Guide</p>
              <h2 className="text-3xl font-semibold text-slate-900">가이드북 모음</h2>
            </div>
          </div>
          <p className="mb-4 text-base leading-relaxed text-slate-600">문서 유형과 동의권 행사를 위한 실전 가이드를 확인하세요.</p>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className={`${accent} font-bold`}>•</span>
              <span>문서 유형별 체크리스트</span>
            </li>
            <li className="flex items-start gap-2">
              <span className={`${accent} font-bold`}>•</span>
              <span>권리 행사 절차 설명</span>
            </li>
            <li className="flex items-start gap-2">
              <span className={`${accent} font-bold`}>•</span>
              <span>자주 묻는 질문</span>
            </li>
          </ul>
        </Link>

        <section className={`${cardClass} border-dashed`}>
          <div className="mb-6 flex items-center gap-3">
            <div className={iconWrap}>
              <Info className={`h-8 w-8 ${accent}`} strokeWidth={2.4} />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900">주요 안내</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="flex items-center gap-3 text-xl font-semibold text-slate-900">
                <FileText className={`h-6 w-6 ${accent}`} strokeWidth={2.4} />
                동의 문서 관리
              </h3>
              <p className="text-base leading-relaxed text-slate-600">
                동의 문서를 업로드하고 요약을 확인하세요. 유형과 목적을 자동 분류하여 개인정보 리스크를 한눈에 보여줍니다.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="flex items-center gap-3 text-xl font-semibold text-slate-900">
                <Shield className={`h-6 w-6 ${accent}`} strokeWidth={2.4} />
                안전 장치
              </h3>
              <ul className="space-y-2 text-base text-slate-600">
                <li className="flex items-start gap-2">
                  <span className={`${accent} font-bold`}>•</span>
                  <span>동의 문서 텍스트/해시 보관</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className={`${accent} font-bold`}>•</span>
                  <span>권리행사 자동 라우팅 (삭제/철회/정지)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className={`${accent} font-bold`}>•</span>
                  <span>문서 유형별 가이드 링크</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className={`${accent} font-bold`}>•</span>
                  <span>요청 진행률·증빙 패키지</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

type SnapshotCardProps = {
  label: string
  value: string
  hint: string
  icon: ReactNode
  barValue?: number
  delta?: number | null
  children?: ReactNode
}

function SnapshotCard({ label, value, hint, icon, barValue = 0, delta, children }: SnapshotCardProps) {
  const clampedBar = Math.min(100, Math.max(0, barValue ?? 0))

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50 p-5 shadow-[0_12px_36px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-xl bg-slate-100 p-3 text-slate-700">{icon}</div>
        {typeof delta === 'number' && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              delta >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div className="mt-4 space-y-1">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-600">{hint}</p>
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-400"
          style={{ width: `${clampedBar}%` }}
        />
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  )
}

type StatusStackProps = {
  counts: Record<string, number>
  total: number
  compact?: boolean
}

function StatusStack({ counts, total, compact = false }: StatusStackProps) {
  const palette: Record<string, string> = {
    SENT: '#38bdf8',
    WAITING: '#fbbf24',
    DONE: '#22c55e',
    REJECTED: '#ef4444',
    DRAFT: '#94a3b8',
    NEED_MORE_INFO: '#a855f7',
  }

  const order = ['SENT', 'WAITING', 'DONE', 'NEED_MORE_INFO', 'REJECTED', 'DRAFT']

  return (
    <div className="space-y-2">
      <div
        className={`flex w-full overflow-hidden rounded-full border border-slate-200 bg-slate-100 ${
          compact ? 'h-2' : 'h-3'
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
              title={`${key}: ${count}건`}
            />
          )
        })}
        {total === 0 && <div className="h-full w-full bg-slate-200" />}
      </div>
      <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
        {order.map((key) => {
          const count = counts[key] ?? 0
          if (count === 0 && total > 0) return null
          return (
            <span
              key={key}
              className="flex items-center gap-1 rounded-full bg-white px-2 py-1 shadow-sm ring-1 ring-slate-200"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: palette[key] }} />
              {key} {total > 0 ? `${count}건` : '0건'}
            </span>
          )
        })}
      </div>
    </div>
  )
}

