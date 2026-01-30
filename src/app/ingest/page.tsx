'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import sampleDocs from '@/receiptos-contracts/samples/documents.json'
import { createReceiptFromText, listReceipts, loadSampleReceipts, saveReceiptToStorage } from '@/lib/receiptClient'
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

  const samples = useMemo(() => sampleDocs as SampleDoc[], [])

  const handleFileChange = (file: File | null) => {
    if (!file) {
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setTextInput(String(reader.result ?? ''))
    }
    reader.readAsText(file)
  }

  const handleGenerate = () => {
    setError('')
    if (!textInput.trim()) {
      setError('Input is empty.')
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
      setError('Select a sample document.')
      return
    }
    const receipt = createReceiptFromText(selectedSample.body)
    saveReceiptToStorage(receipt)
    setReceipts(listReceipts())
    router.push(`/receipt/${receipt.id}`)
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="z-10 w-full max-w-5xl space-y-8 text-sm">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">ReceiptOS</p>
          <h1 className="text-3xl font-semibold">Ingest</h1>
          <p className="text-gray-500">
            Paste an email body or upload an EML/PDF file.
          </p>
        </header>

        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
          <textarea
            className="h-40 w-full rounded-md border border-gray-200 p-3"
            placeholder="Paste email body or consent text"
            value={textInput}
            onChange={(event) => setTextInput(event.target.value)}
          />
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              accept=".eml,.pdf,.txt"
              onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
            />
            <button
              onClick={handleGenerate}
              className="rounded-md bg-black px-4 py-2 text-white"
            >
              Generate Receipt
            </button>
            {error && <span className="text-xs text-red-500">{error}</span>}
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Demo Samples</h2>
            <button
              onClick={handleLoadSamples}
              className="rounded-md border border-gray-200 px-3 py-2"
            >
              Load Sample Receipts
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <select
              className="w-full rounded-md border border-gray-200 px-3 py-2"
              value={selectedSample?.id ?? ''}
              onChange={(event) => {
                const value = event.target.value
                const found = samples.find((item) => item.id === value) ?? null
                setSelectedSample(found)
              }}
            >
              <option value="">Select a sample document</option>
              {samples.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
            <button
              onClick={handleUseSample}
              className="rounded-md border border-gray-200 px-3 py-2"
            >
              Use Sample Document
            </button>
          </div>
        </section>

        <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Saved Receipts</h2>
            <Link href="/dashboard" className="text-xs text-gray-500 underline">
              Go to Dashboard
            </Link>
          </div>
          {receipts.length === 0 && (
            <p className="text-xs text-gray-500">No receipts saved yet.</p>
          )}
          <ul className="space-y-2">
            {receipts.map((receipt) => (
              <li key={receipt.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{receipt.service_name}</p>
                  <p className="text-xs text-gray-500">{receipt.summary}</p>
                </div>
                <Link
                  href={`/receipt/${receipt.id}`}
                  className="text-xs text-gray-500 underline"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}
