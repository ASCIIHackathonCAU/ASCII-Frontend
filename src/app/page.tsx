'use client'

import Link from 'next/link'
import { Upload, BarChart3, BookOpen, Shield, FileText, Info, Mail } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f1e8]">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-10">
        <header className="flex flex-col gap-6">
          <h1 className="text-5xl font-bold text-[#1b1410] leading-tight">
            동의 문서 관리
          </h1>
          <p className="text-xl text-[#2d241f] leading-relaxed">
            동의 문서를 체계적으로 관리하고, 문서 유형과 위험도를 파악하여 개인정보를 보호합니다.
            영수증을 생성하고 패턴을 분석하여 더 나은 개인정보 관리 결정을 내릴 수 있습니다.
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2">
          <Link
            href="/ingest"
            className="group rounded-2xl border-4 border-[#2d241f] bg-white p-8 shadow-lg transition-all hover:bg-[#fffaf4] hover:shadow-xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="rounded-xl bg-[#fff4e6] p-4">
                <Upload className="h-10 w-10 text-[#de3f1c]" strokeWidth={2.5} />
              </div>
              <h2 className="text-3xl font-bold text-[#1b1410]">
                문서 업로드
              </h2>
            </div>
            <p className="text-lg text-[#2d241f] mb-4 leading-relaxed">
              동의 문서를 붙여넣거나 업로드합니다.
            </p>
            <ul className="space-y-2 text-base text-[#2d241f]">
              <li className="flex items-start gap-2">
                <span className="text-[#de3f1c] font-bold">•</span>
                <span>텍스트 붙여넣기 또는 파일 업로드</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#de3f1c] font-bold">•</span>
                <span>샘플 문서로 테스트</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#de3f1c] font-bold">•</span>
                <span>영수증 자동 생성</span>
              </li>
            </ul>
          </Link>

          <Link
            href="/consent-dashboard"
            className="group rounded-2xl border-4 border-[#2d241f] bg-white p-8 shadow-lg transition-all hover:bg-[#fffaf4] hover:shadow-xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="rounded-xl bg-[#fff4e6] p-4">
                <Mail className="h-10 w-10 text-[#de3f1c]" strokeWidth={2.5} />
              </div>
              <h2 className="text-3xl font-bold text-[#1b1410]">
                동의 관리 대시보드
              </h2>
            </div>
            <p className="text-lg text-[#2d241f] mb-4 leading-relaxed">
              이메일에서 동의 관련 메일을 자동으로 수집하고 관리합니다.
            </p>
            <ul className="space-y-2 text-base text-[#2d241f]">
              <li className="flex items-start gap-2">
                <span className="text-[#de3f1c] font-bold">•</span>
                <span>메일 API 연동 (Gmail/Outlook)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#de3f1c] font-bold">•</span>
                <span>동의 메일 자동 분류</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#de3f1c] font-bold">•</span>
                <span>분야별 동의 이력 확인</span>
              </li>
            </ul>
          </Link>

          <Link
            href="/revocation"
            className="group rounded-2xl border-4 border-[#2d241f] bg-white p-8 shadow-lg transition-all hover:bg-[#fffaf4] hover:shadow-xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="rounded-xl bg-[#fff4e6] p-4">
                <FileText className="h-10 w-10 text-[#de3f1c]" strokeWidth={2.5} />
              </div>
              <h2 className="text-3xl font-bold text-[#1b1410]">
                철회/삭제 요청
              </h2>
            </div>
            <p className="text-lg text-[#2d241f] mb-4 leading-relaxed">
              개인정보 삭제, 동의 철회, 제3자 제공 중단 등을 요청합니다.
            </p>
            <ul className="space-y-2 text-base text-[#2d241f]">
              <li className="flex items-start gap-2">
                <span className="text-[#de3f1c] font-bold">•</span>
                <span>요청서 자동 생성</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#de3f1c] font-bold">•</span>
                <span>기관별 제출 경로 안내</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#de3f1c] font-bold">•</span>
                <span>요청 상태 추적</span>
              </li>
            </ul>
          </Link>

          <Link
            href="/dashboard"
            className="group rounded-2xl border-4 border-[#2d241f] bg-white p-8 shadow-lg transition-all hover:bg-[#fffaf4] hover:shadow-xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="rounded-xl bg-[#fff4e6] p-4">
                <BarChart3 className="h-10 w-10 text-[#de3f1c]" strokeWidth={2.5} />
              </div>
              <h2 className="text-3xl font-bold text-[#1b1410]">
                통계 보기
              </h2>
            </div>
            <p className="text-lg text-[#2d241f] mb-4 leading-relaxed">
              패턴 통계와 분포를 확인합니다.
            </p>
            <ul className="space-y-2 text-base text-[#2d241f]">
              <li className="flex items-start gap-2">
                <span className="text-[#de3f1c] font-bold">•</span>
                <span>월별 수신 건수 분석</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#de3f1c] font-bold">•</span>
                <span>위험도별 분류 통계</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#de3f1c] font-bold">•</span>
                <span>카테고리 분포 확인</span>
              </li>
            </ul>
          </Link>
        </div>

        <Link
          href="/inbox"
          className="group rounded-2xl border-4 border-[#2d241f] bg-white p-8 shadow-lg transition-all hover:bg-[#fffaf4] hover:shadow-xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="rounded-xl bg-[#fff4e6] p-4">
              <BookOpen className="h-10 w-10 text-[#de3f1c]" strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-bold text-[#1b1410]">
              가이드라인 보기
            </h2>
          </div>
          <p className="text-lg text-[#2d241f] mb-4 leading-relaxed">
            문서 유형과 위험도 가이드라인을 확인합니다.
          </p>
          <ul className="space-y-2 text-base text-[#2d241f]">
            <li className="flex items-start gap-2">
              <span className="text-[#de3f1c] font-bold">•</span>
              <span>문서 유형별 가이드라인</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#de3f1c] font-bold">•</span>
              <span>위험도 분류 기준</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#de3f1c] font-bold">•</span>
              <span>각 유형별 주의사항</span>
            </li>
          </ul>
        </Link>

        <section className="rounded-2xl border-4 border-[#2d241f] bg-white p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <Info className="h-8 w-8 text-[#de3f1c]" strokeWidth={2.5} />
            <h2 className="text-2xl font-bold text-[#1b1410]">
              서비스 소개
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[#1b1410] flex items-center gap-3">
                <FileText className="h-6 w-6 text-[#de3f1c]" strokeWidth={2.5} />
                동의 문서 관리
              </h3>
              <p className="text-lg text-[#2d241f] leading-relaxed">
                동의 문서를 업로드하고 분석하여 영수증을 생성합니다. 문서의 유형과 위험도를 자동으로 분류하여
                개인정보 보호에 도움을 줍니다.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[#1b1410] flex items-center gap-3">
                <Shield className="h-6 w-6 text-[#de3f1c]" strokeWidth={2.5} />
                주요 기능
              </h3>
              <ul className="space-y-2 text-lg text-[#2d241f]">
                <li className="flex items-start gap-2">
                  <span className="text-[#de3f1c] font-bold">•</span>
                  <span>동의 문서 텍스트 분석 및 구조화</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#de3f1c] font-bold">•</span>
                  <span>위험도 자동 분류 (낮음/보통/높음)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#de3f1c] font-bold">•</span>
                  <span>문서 유형별 가이드라인 제공</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#de3f1c] font-bold">•</span>
                  <span>영수증 패턴 통계 및 분석</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

