'use client'

import { useMemo, useState } from 'react'
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
  const [receipts, setReceipts] = useState<Receipt[]>(() => listReceipts())
  const [selectedSample, setSelectedSample] = useState<SampleDoc | null>(null)
  const [selectedFileName, setSelectedFileName] = useState<string>('')
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const samples = useMemo(() => sampleDocs as SampleDoc[], [])

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

  const handleGenerate = () => {
    setError('')
    if (!textInput.trim()) {
      setError('입력 내용이 비어있습니다.')
      return
    }
    const receipt = createReceiptFromText(textInput)
    saveReceiptToStorage(receipt)
    setReceipts(listReceipts())
    router.push(`/receipt/${receipt.id}`)
  }

  const handleLoadSamples = () => {
    const loaded = loadSampleReceipts()
    setReceipts(loaded)
  }

  const handleUseSample = () => {
    if (!selectedSample) {
      setError('샘플 문서를 선택하세요.')
      return
    }
    const receipt = createReceiptFromText(selectedSample.body)
    saveReceiptToStorage(receipt)
    setReceipts(listReceipts())
    router.push(`/receipt/${receipt.id}`)
  }

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id)
  }

  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return
    deleteReceipt(deleteTargetId)
    setReceipts(listReceipts())
    setDeleteTargetId(null)
  }

  const handleDeleteCancel = () => {
    setDeleteTargetId(null)
  }

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
              Ingest
            </h1>
            <p className="mt-2 text-sm text-[#6b5a4b]">
              이메일 본문을 붙여넣거나 EML/PDF 파일을 업로드합니다.
            </p>
          </div>
        </header>

        <section className="rounded-3xl border border-[#e4d4c3] bg-white p-6 shadow-[0_16px_40px_rgba(50,36,28,0.08)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1b1410]">
            <Upload className="h-4 w-4 text-[#de3f1c]" />
            문서 입력
          </div>
          <p className="mt-2 text-xs text-[#6b5a4b]">
            동의 문서 텍스트를 붙여넣거나 파일을 업로드하세요.
          </p>

          <div className="mt-6 space-y-4">
            <textarea
              className="h-40 w-full rounded-2xl border border-[#e4d4c3] bg-[#fffaf4] p-4 text-sm text-[#1b1410] placeholder:text-[#6b5a4b] focus:border-[#de3f1c] focus:outline-none"
              placeholder="이메일 본문이나 동의 문서 텍스트를 붙여넣으세요"
              value={textInput}
              onChange={(event) => setTextInput(event.target.value)}
            />
            <div className="flex flex-wrap items-center gap-3">
              <label className="cursor-pointer rounded-2xl border border-[#e4d4c3] bg-white px-4 py-2 text-sm font-semibold text-[#1b1410] transition hover:bg-[#fffaf4]">
                <input
                  type="file"
                  accept=".eml,.pdf,.txt"
                  className="hidden"
                  onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
                />
                파일 선택
              </label>
              {selectedFileName && (
                <span className="text-xs text-[#6b5a4b]">{selectedFileName}</span>
              )}
              {!selectedFileName && (
                <span className="text-xs text-[#6b5a4b]">선택된 파일 없음</span>
              )}
              <button
                onClick={handleGenerate}
                className="ml-auto rounded-2xl bg-[#1b1410] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#2d241f]"
              >
                영수증 생성
              </button>
            </div>
            {error && (
              <div className="rounded-2xl border border-[#f1b59f] bg-[#ffe0cc] px-4 py-2 text-xs text-[#b23b1e]">
                {error}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-[#e4d4c3] bg-white p-6 shadow-[0_16px_40px_rgba(50,36,28,0.08)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1b1410]">
            <FileText className="h-4 w-4 text-[#de3f1c]" />
            데모 샘플
          </div>
          <p className="mt-2 text-xs text-[#6b5a4b]">
            샘플 문서를 사용하여 테스트할 수 있습니다.
          </p>

          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <select
                className="flex-1 rounded-2xl border border-[#e4d4c3] bg-[#fffaf4] px-4 py-2 text-sm text-[#1b1410] focus:border-[#de3f1c] focus:outline-none"
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
                className="rounded-2xl border border-[#e4d4c3] bg-white px-4 py-2 text-sm font-semibold text-[#1b1410] transition hover:bg-[#fffaf4]"
              >
                샘플 사용
              </button>
              <button
                onClick={handleLoadSamples}
                className="rounded-2xl border border-[#e4d4c3] bg-white px-4 py-2 text-sm font-semibold text-[#1b1410] transition hover:bg-[#fffaf4]"
              >
                샘플 영수증 로드
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[#e4d4c3] bg-white p-6 shadow-[0_16px_40px_rgba(50,36,28,0.08)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1b1410]">
              <Database className="h-4 w-4 text-[#de3f1c]" />
              저장된 영수증
            </div>
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-[#de3f1c] hover:underline"
            >
              Dashboard로 이동
            </Link>
          </div>
          <p className="mt-2 text-xs text-[#6b5a4b]">
            생성된 영수증 목록을 확인합니다.
          </p>

          {receipts.length === 0 && (
            <div className="mt-6 rounded-2xl border border-[#e4d4c3] bg-[#fffaf4] p-4 text-sm text-[#6b5a4b]">
              아직 저장된 영수증이 없습니다.
            </div>
          )}
          <ul className="mt-6 space-y-3">
            {receipts.map((receipt) => (
              <li
                key={receipt.id}
                className="flex items-center justify-between rounded-2xl border border-[#e4d4c3] bg-[#fffaf4] p-4 transition hover:bg-white"
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#1b1410]">{receipt.service_name}</p>
                  <p className="mt-1 text-xs text-[#6b5a4b]">{receipt.summary}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/receipt/${receipt.id}`}
                    className="text-xs font-semibold text-[#de3f1c] hover:underline"
                  >
                    보기
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(receipt.id)}
                    className="rounded-lg p-1.5 text-[#b23b1e] transition hover:bg-[#ffe0cc]"
                    title="삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {deleteTargetId && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-3xl border border-[#e4d4c3] bg-white p-6 shadow-[0_20px_50px_rgba(15,11,9,0.3)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#1b1410]">영수증 삭제</h3>
              <button
                onClick={handleDeleteCancel}
                className="rounded-lg p-1 text-[#6b5a4b] transition hover:bg-[#fffaf4]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-[#6b5a4b] mb-6">
              이 영수증을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 rounded-2xl border border-[#e4d4c3] bg-white px-4 py-2 text-sm font-semibold text-[#1b1410] transition hover:bg-[#fffaf4]"
              >
                취소
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 rounded-2xl bg-[#b23b1e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#9a3219]"
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
