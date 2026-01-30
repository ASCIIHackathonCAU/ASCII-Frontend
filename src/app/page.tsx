import Link from 'next/link'
import { Upload, BarChart3, BookOpen, Shield, FileText, Info } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f1e8]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b6b53]">
            ASCII
          </p>
          <h1 className="text-4xl font-semibold text-[#1b1410]">
            Consent & Request Receipt Inbox
          </h1>
          <p className="text-sm text-[#6b5a4b]">
            + Eraser & Revocation Concierge
          </p>
          <p className="mt-4 text-sm text-[#6b5a4b] max-w-3xl">
            동의 문서를 체계적으로 관리하고, 문서 유형과 위험도를 파악하여 개인정보를 보호합니다.
            영수증을 생성하고 패턴을 분석하여 더 나은 개인정보 관리 결정을 내릴 수 있습니다.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/ingest"
            className="group rounded-3xl border border-[#e4d4c3] bg-white p-6 shadow-[0_16px_40px_rgba(50,36,28,0.08)] transition hover:-translate-y-1"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-2xl bg-[#fff4e6] p-3">
                <Upload className="h-6 w-6 text-[#de3f1c]" />
              </div>
              <h2 className="text-2xl font-semibold text-[#1b1410]">
                Ingest{' '}
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none text-[#de3f1c]">
                  →
                </span>
              </h2>
            </div>
            <p className="text-sm text-[#6b5a4b] mb-3">
              동의 문서를 붙여넣거나 업로드합니다.
            </p>
            <ul className="space-y-1 text-xs text-[#6b5a4b]">
              <li>• 텍스트 붙여넣기 또는 파일 업로드</li>
              <li>• 샘플 문서로 테스트</li>
              <li>• 영수증 자동 생성</li>
            </ul>
          </Link>

          <Link
            href="/dashboard"
            className="group rounded-3xl border border-[#e4d4c3] bg-white p-6 shadow-[0_16px_40px_rgba(50,36,28,0.08)] transition hover:-translate-y-1"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-2xl bg-[#fff4e6] p-3">
                <BarChart3 className="h-6 w-6 text-[#de3f1c]" />
              </div>
              <h2 className="text-2xl font-semibold text-[#1b1410]">
                Dashboard{' '}
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none text-[#de3f1c]">
                  →
                </span>
              </h2>
            </div>
            <p className="text-sm text-[#6b5a4b] mb-3">
              패턴 통계와 분포를 확인합니다.
            </p>
            <ul className="space-y-1 text-xs text-[#6b5a4b]">
              <li>• 월별 수신 건수 분석</li>
              <li>• 위험도별 분류 통계</li>
              <li>• 카테고리 분포 확인</li>
            </ul>
          </Link>
        </div>

        <Link
          href="/inbox"
          className="group rounded-3xl border border-[#e4d4c3] bg-white p-6 shadow-[0_16px_40px_rgba(50,36,28,0.08)] transition hover:-translate-y-1"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-2xl bg-[#fff4e6] p-3">
              <BookOpen className="h-6 w-6 text-[#de3f1c]" />
            </div>
            <h2 className="text-2xl font-semibold text-[#1b1410]">
              Inbox{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none text-[#de3f1c]">
                →
              </span>
            </h2>
          </div>
          <p className="text-sm text-[#6b5a4b] mb-3">
            문서 유형과 위험도 가이드라인을 확인합니다.
          </p>
          <ul className="space-y-1 text-xs text-[#6b5a4b]">
            <li>• 문서 유형별 가이드라인</li>
            <li>• 위험도 분류 기준</li>
            <li>• 각 유형별 주의사항</li>
          </ul>
        </Link>

        <section className="rounded-3xl border border-[#e4d4c3] bg-white p-6 shadow-[0_16px_40px_rgba(50,36,28,0.08)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1b1410] mb-4">
            <Info className="h-4 w-4 text-[#de3f1c]" />
            서비스 소개
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[#1b1410] flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#de3f1c]" />
                Module A: Consent & Request Receipt Inbox
              </h3>
              <p className="text-xs text-[#6b5a4b]">
                동의 문서를 업로드하고 분석하여 영수증을 생성합니다. 문서의 유형과 위험도를 자동으로 분류하여
                개인정보 보호에 도움을 줍니다.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[#1b1410] flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#de3f1c]" />
                주요 기능
              </h3>
              <ul className="space-y-1 text-xs text-[#6b5a4b]">
                <li>• 동의 문서 텍스트 분석 및 구조화</li>
                <li>• 위험도 자동 분류 (LOW/MED/HIGH)</li>
                <li>• 문서 유형별 가이드라인 제공</li>
                <li>• 영수증 패턴 통계 및 분석</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

