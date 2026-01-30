'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Mail, RefreshCw, AlertCircle, CheckCircle, FileText, Home } from 'lucide-react'
import {
  listEmailAccounts,
  syncEmails,
  listConsentEmails,
  analyzeConsentEmail,
  type EmailAccount,
  type ConsentEmail,
} from '@/lib/api/emailApi'

const CATEGORIES = ['전체', '주거', '금융', '통신', '복지', '취업', '기타']

export default function ConsentDashboardPage() {
  const [accounts, setAccounts] = useState<EmailAccount[]>([])
  const [emails, setEmails] = useState<ConsentEmail[]>([])
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState<string | null>(null)

  useEffect(() => {
    loadAccounts()
    loadEmails()
  }, [])

  const loadAccounts = async () => {
    try {
      const data = await listEmailAccounts()
      console.log('Loaded email accounts:', data)
      setAccounts(data)
      // 계정이 없으면 에러 로그 출력
      if (data.length === 0) {
        console.warn('No email accounts found. Backend should create dummy accounts automatically.')
      }
    } catch (error) {
      console.error('Failed to load email accounts:', error)
      // 에러 발생 시에도 빈 배열로 설정하여 UI가 깨지지 않도록
      setAccounts([])
    }
  }

  const loadEmails = async () => {
    try {
      const category = selectedCategory === '전체' ? undefined : selectedCategory
      const data = await listConsentEmails(category)
      setEmails(data)
    } catch (error) {
      console.error('Failed to load consent emails:', error)
    }
  }

  useEffect(() => {
    loadEmails()
  }, [selectedCategory])

  const handleSync = async (accountId: string) => {
    setSyncing(accountId)
    try {
      await syncEmails({ email_account_id: accountId, max_emails: 50 })
      await loadEmails()
      await loadAccounts()
    } catch (error) {
      console.error('Failed to sync emails:', error)
      alert('이메일 동기화에 실패했습니다.')
    } finally {
      setSyncing(null)
    }
  }

  const handleAnalyze = async (emailId: string) => {
    try {
      await analyzeConsentEmail(emailId)
      await loadEmails()
    } catch (error) {
      console.error('Failed to analyze email:', error)
      alert('이메일 분석에 실패했습니다.')
    }
  }

  const filteredEmails = selectedCategory === '전체'
    ? emails
    : emails.filter((e) => e.category === selectedCategory)

  return (
    <main className="min-h-screen bg-[#f6f1e8]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-[#de3f1c] hover:underline flex items-center gap-2">
            <Home className="h-5 w-5" />
            메인으로 돌아가기
          </Link>
        </div>

        <header>
          <h1 className="text-5xl font-bold text-[#1b1410] leading-tight mb-4">
            동의 관리 대시보드
          </h1>
          <p className="text-xl text-[#2d241f] leading-relaxed">
            이메일에서 동의 관련 메일을 자동으로 수집하고 관리합니다.
          </p>
        </header>

        {/* 이메일 계정 섹션 */}
        <section className="rounded-2xl border-4 border-[#2d241f] bg-white p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="h-8 w-8 text-[#de3f1c]" strokeWidth={2.5} />
            <h2 className="text-2xl font-bold text-[#1b1410]">연결된 이메일 계정</h2>
          </div>

          {accounts.length === 0 ? (
            <div className="rounded-xl border-2 border-[#e4d4c3] bg-[#fffaf4] p-6 text-lg text-[#2d241f]">
              연결된 이메일 계정이 없습니다. 이메일 계정을 연결하세요.
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-xl border-2 border-[#e4d4c3] bg-[#fffaf4] p-6"
                >
                  <div className="flex-1">
                    <p className="text-xl font-bold text-[#1b1410] mb-1">{account.email}</p>
                    <p className="text-lg text-[#2d241f]">
                      {account.provider} • 마지막 동기화:{' '}
                      {account.last_sync_at
                        ? new Date(account.last_sync_at).toLocaleString('ko-KR')
                        : '없음'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSync(account.id)}
                    disabled={syncing === account.id}
                    className="rounded-xl bg-[#de3f1c] px-6 py-3 text-lg font-bold text-white transition hover:bg-[#b23b1e] disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] flex items-center gap-2"
                  >
                    {syncing === account.id ? (
                      <>
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        동기화 중...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-5 w-5" />
                        동기화
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 동의 이메일 목록 */}
        <section className="rounded-2xl border-4 border-[#2d241f] bg-white p-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-[#de3f1c]" strokeWidth={2.5} />
              <h2 className="text-2xl font-bold text-[#1b1410]">동의 관련 이메일</h2>
            </div>
          </div>

          {/* 카테고리 필터 */}
          <div className="flex flex-wrap gap-3 mb-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-6 py-3 text-lg font-bold transition min-h-[48px] ${
                  selectedCategory === cat
                    ? 'bg-[#de3f1c] text-white'
                    : 'bg-[#fffaf4] text-[#1b1410] border-2 border-[#2d241f] hover:bg-[#e4d4c3]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredEmails.length === 0 ? (
            <div className="rounded-xl border-2 border-[#e4d4c3] bg-[#fffaf4] p-6 text-lg text-[#2d241f]">
              동의 관련 이메일이 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  className="rounded-xl border-2 border-[#e4d4c3] bg-[#fffaf4] p-6 transition hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-[#1b1410]">{email.subject}</h3>
                        {email.is_consent_related ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                        )}
                      </div>
                      <p className="text-lg text-[#2d241f] mb-1">발신자: {email.sender}</p>
                      <p className="text-base text-[#6b5a4b]">
                        {new Date(email.received_at).toLocaleString('ko-KR')}
                      </p>
                      {email.category && (
                        <span className="inline-block mt-2 px-3 py-1 rounded-lg bg-[#de3f1c] text-white text-sm font-bold">
                          {email.category}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3">
                      {email.receipt_id ? (
                        <Link
                          href={`/receipt/${email.receipt_id}`}
                          className="rounded-xl bg-[#2d241f] px-6 py-3 text-lg font-bold text-white transition hover:bg-[#1b1410] min-h-[48px] flex items-center"
                        >
                          영수증 보기
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleAnalyze(email.id)}
                          className="rounded-xl bg-[#de3f1c] px-6 py-3 text-lg font-bold text-white transition hover:bg-[#b23b1e] min-h-[48px]"
                        >
                          분석
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

