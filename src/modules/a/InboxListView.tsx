'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, AlertTriangle, Info, Shield, BookOpen } from 'lucide-react'
import { docTypeLabelMap, DocumentType, DocumentRiskLevel } from '@/lib/inboxData'

const riskStyleMap = {
  LOW: 'border-[#b7d6c6] bg-[#e6f6ee] text-[#1e5b3a]',
  MED: 'border-[#f1c7a8] bg-[#ffe8d5] text-[#8a4a1f]',
  HIGH: 'border-[#f1b59f] bg-[#ffe0cc] text-[#b23b1e]',
} as const

const docTypeInfo: Record<DocumentType, { description: string; examples: string[]; warnings: string[] }> = {
  POLICY_UPDATE: {
    description: '정책 또는 약관이 업데이트되었을 때 받는 문서입니다.',
    examples: ['개인정보 처리방침 개정', '이용약관 변경', '서비스 정책 업데이트'],
    warnings: ['보관 기간 변경에 주의하세요', '제3자 제공 조항 변경을 확인하세요', '철회 방법이 변경되었는지 확인하세요'],
  },
  CONSENT_FORM: {
    description: '개인정보 수집 및 이용에 대한 동의서입니다.',
    examples: ['회원가입 동의서', '마케팅 수신 동의', '선택적 정보 수집 동의'],
    warnings: ['수집 항목이 필요한 범위인지 확인하세요', '동의 철회 방법을 확인하세요', '제3자 제공 여부를 확인하세요'],
  },
  DATA_REQUEST: {
    description: '개인정보 관련 요청(삭제, 수정, 조회 등)에 대한 문서입니다.',
    examples: ['개인정보 삭제 요청 접수', '마케팅 수신거부 요청', '제3자 제공 중단 요청'],
    warnings: ['요청 처리 기간을 확인하세요', '추가 서류 요구 여부를 확인하세요', '처리 결과를 확인하세요'],
  },
  HIGH_RISK_REQUEST: {
    description: '고위험 요청으로 분류된 문서입니다. 민감한 정보 요구가 포함될 수 있습니다.',
    examples: ['본인확인 요청 (OTP/계좌 요구)', '비정상적인 정보 요구', '의심스러운 요청'],
    warnings: ['OTP, 계좌번호, 주민번호 등 민감 정보 요구에 주의하세요', '요청의 정당성을 신중히 검토하세요', '의심스러운 경우 해당 기관에 직접 문의하세요'],
  },
}

const riskLevelInfo: Record<DocumentRiskLevel, { description: string; indicators: string[]; actions: string[] }> = {
  LOW: {
    description: '저위험 문서는 일반적인 개인정보 처리 관련 내용입니다.',
    indicators: ['일반적인 정보 수집', '명확한 철회 경로 제공', '합리적인 보관 기간', '제3자 제공 없음'],
    actions: ['문서 내용을 확인하세요', '필요시 동의를 철회할 수 있습니다', '정기적으로 확인하세요'],
  },
  MED: {
    description: '중위험 문서는 일부 주의가 필요한 항목이 포함되어 있습니다.',
    indicators: ['장기 보관 (365일 이상)', '제3자 제공 포함', '불명확한 철회 경로', '과도한 정보 수집'],
    actions: ['수집 항목의 필요성을 검토하세요', '제3자 제공 범위를 확인하세요', '철회 방법을 명확히 파악하세요', '보관 기간이 합리적인지 확인하세요'],
  },
  HIGH: {
    description: '고위험 문서는 민감한 정보 요구나 비정상적인 요청이 포함되어 있을 수 있습니다.',
    indicators: ['OTP 요구', '계좌번호 요구', '주민번호 요구', '비정상적인 요청', '의심스러운 기관'],
    actions: ['요청의 정당성을 신중히 검토하세요', '공식 채널을 통해 확인하세요', '의심스러운 경우 거부하세요', '필요시 관련 기관에 신고하세요'],
  },
}

export default function InboxListView() {
  const [activeTab, setActiveTab] = useState<'types' | 'risks'>('types')

  return (
    <main className="min-h-screen bg-[#f6f1e8]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        <Link href="/" className="text-sm font-semibold text-[#de3f1c] hover:underline self-start">
          ← 메인으로 돌아가기
        </Link>
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b6b53]">
              Module A
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-[#1b1410]">
              문서 유형 & 위험도 가이드라인
            </h1>
            <p className="mt-2 text-sm text-[#6b5a4b]">
              문서 유형과 위험도 분류 기준을 확인하고 주의사항을 알아봅니다.
            </p>
          </div>
        </header>

        <div className="flex gap-2 border-b border-[#e4d4c3]">
          <button
            onClick={() => setActiveTab('types')}
            className={`px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'types'
                ? 'border-b-2 border-[#de3f1c] text-[#1b1410]'
                : 'text-[#6b5a4b] hover:text-[#1b1410]'
            }`}
          >
            <BookOpen className="inline-block h-4 w-4 mr-2" />
            문서 유형
          </button>
          <button
            onClick={() => setActiveTab('risks')}
            className={`px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'risks'
                ? 'border-b-2 border-[#de3f1c] text-[#1b1410]'
                : 'text-[#6b5a4b] hover:text-[#1b1410]'
            }`}
          >
            <Shield className="inline-block h-4 w-4 mr-2" />
            위험도 분류
          </button>
        </div>

        {activeTab === 'types' && (
          <section className="rounded-3xl border border-[#e4d4c3] bg-white p-6 shadow-[0_16px_40px_rgba(50,36,28,0.08)]">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1b1410]">
              <FileText className="h-4 w-4 text-[#de3f1c]" />
              문서 유형 가이드라인
            </div>
            <p className="mt-2 text-xs text-[#6b5a4b]">
              각 문서 유형의 특징과 주의사항을 확인합니다.
            </p>

            <div className="mt-6 space-y-6">
              {(Object.keys(docTypeInfo) as DocumentType[]).map((docType) => {
                const info = docTypeInfo[docType]
                return (
                  <div
                    key={docType}
                    className="rounded-2xl border border-[#e4d4c3] bg-[#fffaf4] p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full border border-[#e4d4c3] bg-white px-3 py-1 text-xs font-semibold text-[#1b1410]">
                            {docTypeLabelMap[docType]}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-[#6b5a4b]">{info.description}</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-[#8b6b53] uppercase mb-2">예시</p>
                        <ul className="space-y-1">
                          {info.examples.map((example, idx) => (
                            <li key={idx} className="text-xs text-[#6b5a4b] flex items-start gap-2">
                              <span className="text-[#de3f1c]">•</span>
                              <span>{example}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-[#8b6b53] uppercase mb-2 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          주의사항
                        </p>
                        <ul className="space-y-1">
                          {info.warnings.map((warning, idx) => (
                            <li key={idx} className="text-xs text-[#b23b1e] flex items-start gap-2">
                              <span className="text-[#de3f1c]">⚠</span>
                              <span>{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {activeTab === 'risks' && (
          <section className="rounded-3xl border border-[#e4d4c3] bg-white p-6 shadow-[0_16px_40px_rgba(50,36,28,0.08)]">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1b1410]">
              <Shield className="h-4 w-4 text-[#de3f1c]" />
              위험도 분류 가이드라인
            </div>
            <p className="mt-2 text-xs text-[#6b5a4b]">
              위험도 분류 기준과 각 위험도별 권장 조치사항을 확인합니다.
            </p>

            <div className="mt-6 space-y-6">
              {(['LOW', 'MED', 'HIGH'] as DocumentRiskLevel[]).map((riskLevel) => {
                const info = riskLevelInfo[riskLevel]
                return (
                  <div
                    key={riskLevel}
                    className="rounded-2xl border p-5"
                    style={{
                      borderColor: riskLevel === 'LOW' ? '#b7d6c6' : riskLevel === 'MED' ? '#f1c7a8' : '#f1b59f',
                      backgroundColor: riskLevel === 'LOW' ? '#e6f6ee' : riskLevel === 'MED' ? '#ffe8d5' : '#ffe0cc',
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskStyleMap[riskLevel]}`}
                          >
                            {riskLevel}
                          </span>
                        </div>
                        <p className="mt-3 text-sm" style={{ color: riskLevel === 'LOW' ? '#1e5b3a' : riskLevel === 'MED' ? '#8a4a1f' : '#b23b1e' }}>
                          {info.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase mb-2 flex items-center gap-1" style={{ color: riskLevel === 'LOW' ? '#1e5b3a' : riskLevel === 'MED' ? '#8a4a1f' : '#b23b1e' }}>
                          <Info className="h-3 w-3" />
                          분류 기준
                        </p>
                        <ul className="space-y-1">
                          {info.indicators.map((indicator, idx) => (
                            <li key={idx} className="text-xs flex items-start gap-2" style={{ color: riskLevel === 'LOW' ? '#1e5b3a' : riskLevel === 'MED' ? '#8a4a1f' : '#b23b1e' }}>
                              <span>•</span>
                              <span>{indicator}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase mb-2 flex items-center gap-1" style={{ color: riskLevel === 'LOW' ? '#1e5b3a' : riskLevel === 'MED' ? '#8a4a1f' : '#b23b1e' }}>
                          <Shield className="h-3 w-3" />
                          권장 조치
                        </p>
                        <ul className="space-y-1">
                          {info.actions.map((action, idx) => (
                            <li key={idx} className="text-xs flex items-start gap-2" style={{ color: riskLevel === 'LOW' ? '#1e5b3a' : riskLevel === 'MED' ? '#8a4a1f' : '#b23b1e' }}>
                              <span>✓</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        <section className="rounded-3xl border border-[#e4d4c3] bg-white p-6 shadow-[0_16px_40px_rgba(50,36,28,0.08)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1b1410]">
            <Info className="h-4 w-4 text-[#de3f1c]" />
            참고사항
          </div>
          <div className="mt-4 space-y-2 text-xs text-[#6b5a4b]">
            <p>• 이 가이드라인은 일반적인 기준을 제시하며, 실제 문서의 내용에 따라 위험도가 달라질 수 있습니다.</p>
            <p>• 의심스러운 요청이나 불명확한 내용이 있는 경우, 해당 기관에 직접 문의하시기 바랍니다.</p>
            <p>• 개인정보 보호법에 따라 동의 철회 권리가 보장되므로, 필요시 언제든지 철회할 수 있습니다.</p>
            <p>• 고위험 요청의 경우, 공식 채널을 통해 요청의 정당성을 확인하시기 바랍니다.</p>
          </div>
        </section>
      </div>
    </main>
  )
}
