'use client'

import Link from 'next/link'
import { Upload, BarChart3, BookOpen, Shield, FileText, Info, Mail } from 'lucide-react'

const cardClass =
  'group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(15,23,42,0.12)]'

const iconWrap = 'rounded-xl bg-gradient-to-br from-sky-100 via-indigo-50 to-white p-4 shadow-inner'
const accent = 'text-sky-600'

export default function Home() {
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

