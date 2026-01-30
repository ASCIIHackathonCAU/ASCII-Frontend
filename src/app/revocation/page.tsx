'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, Send, Clock, CheckCircle, XCircle, AlertCircle, Home, Plus } from 'lucide-react'
import {
  createRevocationRequest,
  listRevocationRequests,
  getRevocationRequest,
  generateRevocationLetter,
  sendRevocationRequest,
  getRevocationTimeline,
  type RevocationRequest,
  type RevocationRequestCreate,
  type RevocationTimelineEvent,
} from '@/lib/api/revocationApi'
import { listReceipts } from '@/lib/receiptClient'
import { Receipt } from '@/lib/receiptTypes'

const REQUEST_TYPES = [
  { value: 'DELETE', label: '개인정보 삭제' },
  { value: 'WITHDRAW_CONSENT', label: '동의 철회' },
  { value: 'STOP_THIRD_PARTY', label: '제3자 제공 중단' },
  { value: 'LIMIT_PROCESSING', label: '처리 제한' },
]

const STATUS_LABELS: Record<string, string> = {
  DRAFT: '초안',
  SENT: '전송됨',
  WAITING: '응답 대기',
  DONE: '완료',
  REJECTED: '거절됨',
  NEED_MORE_INFO: '추가 정보 필요',
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-500',
  SENT: 'bg-blue-500',
  WAITING: 'bg-yellow-500',
  DONE: 'bg-green-500',
  REJECTED: 'bg-red-500',
  NEED_MORE_INFO: 'bg-orange-500',
}

export default function RevocationPage() {
  const [requests, setRequests] = useState<RevocationRequest[]>([])
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [selectedRequest, setSelectedRequest] = useState<RevocationRequest | null>(null)
  const [timeline, setTimeline] = useState<RevocationTimelineEvent[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState<Partial<RevocationRequestCreate>>({
    service_name: '',
    entity_name: '',
    request_type: 'DELETE',
  })

  useEffect(() => {
    loadRequests()
    loadReceipts()
  }, [])

  useEffect(() => {
    if (selectedRequest) {
      loadTimeline(selectedRequest.id)
    }
  }, [selectedRequest])

  const loadRequests = async () => {
    try {
      const data = await listRevocationRequests()
      setRequests(data)
    } catch (error) {
      console.error('Failed to load requests:', error)
    }
  }

  const loadReceipts = async () => {
    try {
      const data = await listReceipts()
      setReceipts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load receipts:', error)
    }
  }

  const loadTimeline = async (requestId: string) => {
    try {
      const data = await getRevocationTimeline(requestId)
      setTimeline(data)
    } catch (error) {
      console.error('Failed to load timeline:', error)
    }
  }

  const handleCreate = async () => {
    if (!formData.service_name || !formData.entity_name) {
      alert('서비스명과 기관명을 입력하세요.')
      return
    }

    setLoading(true)
    try {
      await createRevocationRequest(formData as RevocationRequestCreate)
      await loadRequests()
      setShowCreateForm(false)
      setFormData({ service_name: '', entity_name: '', request_type: 'DELETE' })
    } catch (error) {
      console.error('Failed to create request:', error)
      alert('요청 생성에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateLetter = async (requestId: string) => {
    try {
      await generateRevocationLetter(requestId)
      const updated = await getRevocationRequest(requestId)
      setSelectedRequest(updated)
      await loadRequests()
    } catch (error) {
      console.error('Failed to generate letter:', error)
      alert('요청서 생성에 실패했습니다.')
    }
  }

  const handleSend = async (requestId: string) => {
    if (!confirm('요청서를 전송하시겠습니까?')) return

    try {
      await sendRevocationRequest(requestId)
      const updated = await getRevocationRequest(requestId)
      setSelectedRequest(updated)
      await loadRequests()
      await loadTimeline(requestId)
    } catch (error) {
      console.error('Failed to send request:', error)
      alert('요청 전송에 실패했습니다.')
    }
  }

  const handleSelectReceipt = (receiptId: string) => {
    const receipt = receipts.find((r) => r.id === receiptId)
    if (receipt) {
      setFormData({
        ...formData,
        receipt_id: receiptId,
        service_name: receipt.service_name,
        entity_name: receipt.entity_name || '',
      })
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f1e8]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-[#de3f1c] hover:underline flex items-center gap-2">
            <Home className="h-5 w-5" />
            메인으로 돌아가기
          </Link>
        </div>

        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold text-[#1b1410] leading-tight mb-4">
              철회/삭제 요청 관리
            </h1>
            <p className="text-xl text-[#2d241f] leading-relaxed">
              개인정보 삭제, 동의 철회, 제3자 제공 중단 등을 요청합니다.
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="rounded-xl bg-[#de3f1c] px-6 py-4 text-lg font-bold text-white transition hover:bg-[#b23b1e] min-h-[56px] flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            새 요청 생성
          </button>
        </header>

        {/* 요청 생성 폼 */}
        {showCreateForm && (
          <section className="rounded-2xl border-4 border-[#2d241f] bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-[#1b1410] mb-6">새 철회 요청 생성</h2>

            <div className="space-y-6">
              {/* 영수증 선택 */}
              {receipts.length > 0 && (
                <div>
                  <label className="block text-lg font-bold text-[#1b1410] mb-2">
                    영수증에서 선택 (선택사항)
                  </label>
                  <select
                    className="w-full rounded-xl border-2 border-[#2d241f] bg-[#fffaf4] px-5 py-4 text-lg text-[#1b1410] focus:border-[#de3f1c] focus:outline-none focus:ring-2 focus:ring-[#de3f1c] min-h-[56px]"
                    onChange={(e) => handleSelectReceipt(e.target.value)}
                  >
                    <option value="">영수증 선택...</option>
                    {receipts.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.service_name} - {r.entity_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-lg font-bold text-[#1b1410] mb-2">서비스명 *</label>
                <input
                  type="text"
                  className="w-full rounded-xl border-2 border-[#2d241f] bg-[#fffaf4] px-5 py-4 text-lg text-[#1b1410] focus:border-[#de3f1c] focus:outline-none focus:ring-2 focus:ring-[#de3f1c] min-h-[56px]"
                  value={formData.service_name}
                  onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                  placeholder="예: 네이버, 카카오톡"
                />
              </div>

              <div>
                <label className="block text-lg font-bold text-[#1b1410] mb-2">기관명 *</label>
                <input
                  type="text"
                  className="w-full rounded-xl border-2 border-[#2d241f] bg-[#fffaf4] px-5 py-4 text-lg text-[#1b1410] focus:border-[#de3f1c] focus:outline-none focus:ring-2 focus:ring-[#de3f1c] min-h-[56px]"
                  value={formData.entity_name}
                  onChange={(e) => setFormData({ ...formData, entity_name: e.target.value })}
                  placeholder="예: 네이버(주), 카카오(주)"
                />
              </div>

              <div>
                <label className="block text-lg font-bold text-[#1b1410] mb-2">요청 유형 *</label>
                <select
                  className="w-full rounded-xl border-2 border-[#2d241f] bg-[#fffaf4] px-5 py-4 text-lg text-[#1b1410] focus:border-[#de3f1c] focus:outline-none focus:ring-2 focus:ring-[#de3f1c] min-h-[56px]"
                  value={formData.request_type}
                  onChange={(e) =>
                    setFormData({ ...formData, request_type: e.target.value as any })
                  }
                >
                  {REQUEST_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="flex-1 rounded-xl bg-[#de3f1c] px-6 py-4 text-lg font-bold text-white transition hover:bg-[#b23b1e] disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px]"
                >
                  {loading ? '생성 중...' : '요청 생성'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    setFormData({ service_name: '', entity_name: '', request_type: 'DELETE' })
                  }}
                  className="flex-1 rounded-xl border-2 border-[#2d241f] bg-white px-6 py-4 text-lg font-bold text-[#1b1410] transition hover:bg-[#fffaf4] min-h-[56px]"
                >
                  취소
                </button>
              </div>
            </div>
          </section>
        )}

        {/* 요청 목록 */}
        <section className="rounded-2xl border-4 border-[#2d241f] bg-white p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-[#1b1410] mb-6">요청 목록</h2>

          {requests.length === 0 ? (
            <div className="rounded-xl border-2 border-[#e4d4c3] bg-[#fffaf4] p-6 text-lg text-[#2d241f]">
              생성된 요청이 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className={`rounded-xl border-2 p-6 transition cursor-pointer ${
                    selectedRequest?.id === request.id
                      ? 'border-[#de3f1c] bg-[#ffe0cc]'
                      : 'border-[#e4d4c3] bg-[#fffaf4] hover:bg-white'
                  }`}
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-[#1b1410]">{request.service_name}</h3>
                        <span
                          className={`px-3 py-1 rounded-lg text-white text-sm font-bold ${STATUS_COLORS[request.status]}`}
                        >
                          {STATUS_LABELS[request.status]}
                        </span>
                      </div>
                      <p className="text-lg text-[#2d241f] mb-1">기관: {request.entity_name}</p>
                      <p className="text-base text-[#6b5a4b]">
                        {REQUEST_TYPES.find((t) => t.value === request.request_type)?.label} •{' '}
                        {new Date(request.created_at).toLocaleString('ko-KR')}
                      </p>
                      {request.routing && (
                        <p className="text-sm text-[#6b5a4b] mt-2">
                          제출 경로: {request.routing.destination}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 요청 상세 */}
        {selectedRequest && (
          <section className="rounded-2xl border-4 border-[#2d241f] bg-white p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#1b1410]">요청 상세</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="rounded-xl p-2 text-[#2d241f] transition hover:bg-[#fffaf4]"
              >
                닫기
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-[#1b1410] mb-2">기본 정보</h3>
                <div className="rounded-xl border-2 border-[#e4d4c3] bg-[#fffaf4] p-4 space-y-2">
                  <p>
                    <span className="font-bold">서비스:</span> {selectedRequest.service_name}
                  </p>
                  <p>
                    <span className="font-bold">기관:</span> {selectedRequest.entity_name}
                  </p>
                  <p>
                    <span className="font-bold">요청 유형:</span>{' '}
                    {REQUEST_TYPES.find((t) => t.value === selectedRequest.request_type)?.label}
                  </p>
                  <p>
                    <span className="font-bold">상태:</span>{' '}
                    <span className={STATUS_COLORS[selectedRequest.status] + ' text-white px-2 py-1 rounded'}>
                      {STATUS_LABELS[selectedRequest.status]}
                    </span>
                  </p>
                </div>
              </div>

              {selectedRequest.routing && (
                <div>
                  <h3 className="text-xl font-bold text-[#1b1410] mb-2">제출 경로</h3>
                  <div className="rounded-xl border-2 border-[#e4d4c3] bg-[#fffaf4] p-4">
                    <p className="font-bold mb-2">{selectedRequest.routing.destination}</p>
                    {selectedRequest.routing.instructions.length > 0 && (
                      <ul className="list-disc list-inside space-y-1">
                        {selectedRequest.routing.instructions.map((inst, idx) => (
                          <li key={idx}>{inst}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-[#1b1410] mb-2">작업</h3>
                <div className="flex gap-4">
                  {selectedRequest.status === 'DRAFT' && (
                    <>
                      <button
                        onClick={() => handleGenerateLetter(selectedRequest.id)}
                        className="rounded-xl bg-[#de3f1c] px-6 py-3 text-lg font-bold text-white transition hover:bg-[#b23b1e] min-h-[48px] flex items-center gap-2"
                      >
                        <FileText className="h-5 w-5" />
                        요청서 생성
                      </button>
                      <button
                        onClick={() => handleSend(selectedRequest.id)}
                        className="rounded-xl bg-[#2d241f] px-6 py-3 text-lg font-bold text-white transition hover:bg-[#1b1410] min-h-[48px] flex items-center gap-2"
                      >
                        <Send className="h-5 w-5" />
                        전송
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* 타임라인 */}
              {timeline.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-[#1b1410] mb-2">진행 상황</h3>
                  <div className="space-y-3">
                    {timeline.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-4 rounded-xl border-2 border-[#e4d4c3] bg-[#fffaf4] p-4"
                      >
                        <div className="flex-shrink-0">
                          {event.event === 'CREATED' && <FileText className="h-6 w-6 text-[#de3f1c]" />}
                          {event.event === 'SENT' && <Send className="h-6 w-6 text-blue-500" />}
                          {event.event === 'WAITING' && <Clock className="h-6 w-6 text-yellow-500" />}
                          {event.event === 'DONE' && <CheckCircle className="h-6 w-6 text-green-500" />}
                          {event.event === 'REJECTED' && <XCircle className="h-6 w-6 text-red-500" />}
                          {event.event === 'NEED_MORE_INFO' && (
                            <AlertCircle className="h-6 w-6 text-orange-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-[#1b1410]">{event.event}</p>
                          {event.note && <p className="text-[#2d241f]">{event.note}</p>}
                          <p className="text-sm text-[#6b5a4b]">
                            {new Date(event.occurred_at).toLocaleString('ko-KR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

