'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Upload, FileText, Database, Trash2, X } from 'lucide-react'
import sampleDocs from '@/receiptos-contracts/samples/documents.json'
import { createReceiptFromText, listReceipts, loadSampleReceipts, saveReceiptToStorage } from '@/lib/receiptClient'
import { deleteReceipt } from '@/lib/receiptStorage'
import { Receipt } from '@/lib/receiptTypes'

type SampleDoc = {
  id: string
  title: string
  body: string
}

export default function IngestPage() {
  const router = useRouter()
  const [textInput, setTextInput] = useState('')
  const [error, setError] = useState('')
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSample, setSelectedSample] = useState<SampleDoc | null>(null)
  const [selectedFileName, setSelectedFileName] = useState<string>('')
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const samples = useMemo(() => sampleDocs as SampleDoc[], [])

  useEffect(() => {
    loadReceipts()
  }, [])

  const loadReceipts = async () => {
    try {
      const result = await listReceipts()
      setReceipts(Array.isArray(result) ? result : [])
    } catch (error) {
      console.error('Failed to load receipts:', error)
      setReceipts([])
      // 백엔드 연결 실패 시 사용자에게 알림
      const mockEnabled = process.env.NEXT_PUBLIC_MOCK === 'true'
      if (!mockEnabled) {
        setError('백엔드 서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인하세요.')
      }
    }
  }

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setSelectedFileName('')
      return
    }
    setSelectedFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      setTextInput(String(reader.result ?? ''))
    }
    reader.readAsText(file)
  }

  const handleGenerate = async () => {
    setError('')
    setLoading(true)
    if (!textInput.trim()) {
      setError('입력 내용이 비어있습니다.')
      setLoading(false)
      return
    }
    try {
      const receipt = await createReceiptFromText(textInput, 'manual')
      await saveReceiptToStorage(receipt)
      await loadReceipts()
      router.push(`/receipt/${receipt.id}`)
    } catch (err) {
      setError('영수증 생성에 실패했습니다. 다시 시도해주세요.')
      console.error('Failed to generate receipt:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadSamples = () => {
    const loaded = loadSampleReceipts()
    setReceipts(loaded)
    // Mock 모드에서만 사용
  }

  const handleUseSample = async () => {
    if (!selectedSample) {
      setError('샘플 문서를 선택하세요.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const receipt = await createReceiptFromText(selectedSample.body, 'sample')
      await saveReceiptToStorage(receipt)
      await loadReceipts()
      router.push(`/receipt/${receipt.id}`)
    } catch (err: any) {
      const errorMessage = err?.message || '샘플 문서 처리에 실패했습니다.'
      setError(errorMessage)
      console.error('Failed to process sample:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return
    try {
      await deleteReceipt(deleteTargetId)
      await loadReceipts()
      setDeleteTargetId(null)
    } catch (err) {
      setError('삭제에 실패했습니다.')
      console.error('Failed to delete receipt:', err)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteTargetId(null)
  }

  return (
    <main className="min-h-screen bg-[#f6f1e8]">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-10">
        <Link href="/" className="text-lg font-bold text-[#de3f1c] hover:underline self-start py-2">
          ← 메인으로 돌아가기
        </Link>
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-5xl font-bold text-[#1b1410] leading-tight">
              문서 업로드
            </h1>
            <p className="mt-4 text-xl text-[#2d241f] leading-relaxed">
              이메일 본문을 붙여넣거나 파일을 업로드합니다.
            </p>
          </div>
        </header>

        <section className="rounded-2xl border-4 border-[#2d241f] bg-white p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="h-8 w-8 text-[#de3f1c]" strokeWidth={2.5} />
            <h2 className="text-2xl font-bold text-[#1b1410]">
              문서 입력
            </h2>
          </div>
          <p className="mb-6 text-lg text-[#2d241f] leading-relaxed">
            동의 문서 텍스트를 붙여넣거나 파일을 업로드하세요.
          </p>

          <div className="space-y-6">
            <textarea
              className="h-48 w-full rounded-xl border-2 border-[#2d241f] bg-[#fffaf4] p-5 text-lg text-[#1b1410] placeholder:text-[#6b5a4b] focus:border-[#de3f1c] focus:outline-none focus:ring-2 focus:ring-[#de3f1c]"
              placeholder="이메일 본문이나 동의 문서 텍스트를 붙여넣으세요"
              value={textInput}
              onChange={(event) => setTextInput(event.target.value)}
            />
            <div className="flex flex-wrap items-center gap-4">
              <label className="cursor-pointer rounded-xl border-2 border-[#2d241f] bg-white px-6 py-4 text-lg font-bold text-[#1b1410] transition hover:bg-[#fffaf4] hover:shadow-md min-h-[56px] flex items-center">
                <input
                  type="file"
                  accept=".eml,.pdf,.txt"
                  className="hidden"
                  onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
                />
                파일 선택
              </label>
              {selectedFileName && (
                <span className="text-lg font-semibold text-[#2d241f]">{selectedFileName}</span>
              )}
              {!selectedFileName && (
                <span className="text-lg text-[#6b5a4b]">선택된 파일 없음</span>
              )}
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="ml-auto rounded-xl bg-[#de3f1c] px-8 py-4 text-lg font-bold text-white transition hover:bg-[#b23b1e] disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px]"
              >
                {loading ? '생성 중...' : '영수증 생성'}
              </button>
            </div>
            {error && (
              <div className="rounded-xl border-2 border-[#f1b59f] bg-[#ffe0cc] px-6 py-4 text-lg font-semibold text-[#b23b1e]">
                {error}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border-4 border-[#2d241f] bg-white p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-8 w-8 text-[#de3f1c]" strokeWidth={2.5} />
            <h2 className="text-2xl font-bold text-[#1b1410]">
              데모 샘플
            </h2>
          </div>
          <p className="mb-6 text-lg text-[#2d241f] leading-relaxed">
            샘플 문서를 사용하여 테스트할 수 있습니다.
          </p>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <select
                className="flex-1 rounded-xl border-2 border-[#2d241f] bg-[#fffaf4] px-5 py-4 text-lg text-[#1b1410] focus:border-[#de3f1c] focus:outline-none focus:ring-2 focus:ring-[#de3f1c] min-h-[56px]"
                value={selectedSample?.id ?? ''}
                onChange={(event) => {
                  const value = event.target.value
                  const found = samples.find((item) => item.id === value) ?? null
                  setSelectedSample(found)
                }}
              >
                <option value="">샘플 문서 선택</option>
                {samples.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
              <button
                onClick={handleUseSample}
                className="rounded-xl border-2 border-[#2d241f] bg-white px-6 py-4 text-lg font-bold text-[#1b1410] transition hover:bg-[#fffaf4] hover:shadow-md min-h-[56px]"
              >
                샘플 사용
              </button>
              <button
                onClick={handleLoadSamples}
                className="rounded-xl border-2 border-[#2d241f] bg-white px-6 py-4 text-lg font-bold text-[#1b1410] transition hover:bg-[#fffaf4] hover:shadow-md min-h-[56px]"
              >
                샘플 영수증 로드
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border-4 border-[#2d241f] bg-white p-8 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-[#de3f1c]" strokeWidth={2.5} />
              <h2 className="text-2xl font-bold text-[#1b1410]">
                저장된 영수증
              </h2>
            </div>
            <Link
              href="/dashboard"
              className="rounded-xl bg-[#de3f1c] px-6 py-3 text-lg font-bold text-white transition hover:bg-[#b23b1e] min-h-[48px] flex items-center"
            >
              통계 보기
            </Link>
          </div>
          <p className="mb-6 text-lg text-[#2d241f] leading-relaxed">
            생성된 영수증 목록을 확인합니다.
          </p>

          {receipts.length === 0 && (
            <div className="rounded-xl border-2 border-[#e4d4c3] bg-[#fffaf4] p-6 text-lg text-[#2d241f]">
              아직 저장된 영수증이 없습니다.
            </div>
          )}
          <ul className="space-y-4">
            {receipts.map((receipt) => (
              <li
                key={receipt.id}
                className="flex items-center justify-between rounded-xl border-2 border-[#e4d4c3] bg-[#fffaf4] p-6 transition hover:bg-white hover:shadow-md"
              >
                <div className="flex-1">
                  <p className="text-xl font-bold text-[#1b1410] mb-2">{receipt.service_name}</p>
                  <p className="text-lg text-[#2d241f]">{receipt.summary}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Link
                    href={`/receipt/${receipt.id}`}
                    className="rounded-xl bg-[#de3f1c] px-6 py-3 text-lg font-bold text-white transition hover:bg-[#b23b1e] min-h-[48px] flex items-center"
                  >
                    보기
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(receipt.id)}
                    className="rounded-xl bg-[#ffe0cc] p-3 text-[#b23b1e] transition hover:bg-[#f1b59f] min-h-[48px] min-w-[48px] flex items-center justify-center"
                    title="삭제"
                  >
                    <Trash2 className="h-6 w-6" strokeWidth={2.5} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {deleteTargetId && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-2xl border-4 border-[#2d241f] bg-white p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#1b1410]">영수증 삭제</h3>
              <button
                onClick={handleDeleteCancel}
                className="rounded-xl p-2 text-[#2d241f] transition hover:bg-[#fffaf4] min-h-[48px] min-w-[48px] flex items-center justify-center"
              >
                <X className="h-6 w-6" strokeWidth={2.5} />
              </button>
            </div>
            <p className="text-xl text-[#2d241f] mb-8 leading-relaxed">
              이 영수증을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 rounded-xl border-2 border-[#2d241f] bg-white px-6 py-4 text-lg font-bold text-[#1b1410] transition hover:bg-[#fffaf4] min-h-[56px]"
              >
                취소
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 rounded-xl bg-[#b23b1e] px-6 py-4 text-lg font-bold text-white transition hover:bg-[#9a3219] min-h-[56px]"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
