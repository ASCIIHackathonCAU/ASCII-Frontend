import Link from 'next/link'

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
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/ingest"
            className="group rounded-3xl border border-[#e4d4c3] bg-white p-6 shadow-[0_16px_40px_rgba(50,36,28,0.08)] transition hover:-translate-y-1"
          >
            <h2 className="mb-3 text-2xl font-semibold text-[#1b1410]">
              Ingest{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none text-[#de3f1c]">
                →
              </span>
            </h2>
            <p className="text-sm text-[#6b5a4b]">
              동의 문서를 붙여넣거나 업로드합니다.
            </p>
          </Link>

          <Link
            href="/dashboard"
            className="group rounded-3xl border border-[#e4d4c3] bg-white p-6 shadow-[0_16px_40px_rgba(50,36,28,0.08)] transition hover:-translate-y-1"
          >
            <h2 className="mb-3 text-2xl font-semibold text-[#1b1410]">
              Dashboard{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none text-[#de3f1c]">
                →
              </span>
            </h2>
            <p className="text-sm text-[#6b5a4b]">
              패턴 통계와 분포를 확인합니다.
            </p>
          </Link>
        </div>
      </div>
    </main>
  )
}

