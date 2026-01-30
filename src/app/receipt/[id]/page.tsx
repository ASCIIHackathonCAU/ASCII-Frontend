'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getReceiptById } from '@/lib/receiptStorage'
import { Receipt } from '@/lib/receiptTypes'

const buildTemplate = (receipt: Receipt, type: 'optout' | 'inquiry' | 'delete') => {
  if (type === 'optout') {
    return `Hello ${receipt.entity_name},\n\nI would like to opt out of marketing messages for ${receipt.service_name}.\nChannels: Email/SMS/App\nDocument: ${receipt.doc_type}\n\nThank you.`
  }
  if (type === 'inquiry') {
    return `Hello ${receipt.entity_name},\n\nI am requesting details about data handling for ${receipt.service_name}.\nRetention: ${receipt.retention}\nThird-party sharing: ${receipt.third_party_services.join(', ') || 'None'}\nRevoke path: ${receipt.revoke_path ?? 'Needs clarification'}\n\nPlease reply with details.`
  }
  return `Hello ${receipt.entity_name},\n\nPlease delete or rectify my personal data for ${receipt.service_name}.\nRequested items: ${receipt.data_items.join(', ')}\nDocument: ${receipt.doc_type}\n\nPlease confirm once completed.`
}

export default function ReceiptDetailPage() {
  const params = useParams<{ id: string }>()
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [activeTemplate, setActiveTemplate] = useState<'optout' | 'inquiry' | 'delete'>('optout')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!params?.id) {
      return
    }
    setReceipt(getReceiptById(params.id))
  }, [params])

  const templateText = useMemo(() => {
    if (!receipt) {
      return ''
    }
    return buildTemplate(receipt, activeTemplate)
  }, [receipt, activeTemplate])

  const handleCopy = async () => {
    setCopied(false)
    if (!templateText) {
      return
    }
    await navigator.clipboard.writeText(templateText)
    setCopied(true)
  }

  const handlePrint = () => {
    if (typeof window === 'undefined') {
      return
    }
    window.print()
  }

  if (!receipt) {
    return (
      <main className="flex min-h-screen flex-col items-center p-24">
        <div className="w-full max-w-3xl space-y-4">
          <Link href="/ingest" className="text-xs text-gray-500 underline">
            <- Back to Ingest
          </Link>
          <p className="text-sm text-gray-500">Receipt not found.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-3xl space-y-8">
        <Link href="/ingest" className="text-xs text-gray-500 underline">
          <- Back to Ingest
        </Link>

        <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-6">
          <h1 className="text-2xl font-semibold">{receipt.service_name}</h1>
          <p className="text-sm text-gray-500">{receipt.summary}</p>
          <div className="space-y-2 text-sm">
            <div>1. Service: {receipt.service_name}</div>
            <div>2. Entity: {receipt.entity_name}</div>
            <div>3. Document type: {receipt.doc_type}</div>
            <div>4. Received: {new Date(receipt.received_at).toLocaleString('en-US')}</div>
            <div>5. Data items: {receipt.data_items.join(', ')}</div>
            <div>6. Retention: {receipt.retention}</div>
            <div>7. Revoke path: {receipt.revoke_path ?? 'Needs clarification'}</div>
          </div>
        </section>

        <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold">Evidence Highlights</h2>
          <ul className="space-y-2 text-sm">
            {receipt.evidence.map((item, index) => (
              <li key={`${item.field}-${index}`} className="rounded-md border border-gray-200 p-3">
                <p className="font-semibold">{item.field}</p>
                <p className="text-gray-600">"{item.quote}"</p>
                <p className="text-xs text-gray-500">{item.why}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold">Action Templates</h2>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => setActiveTemplate('optout')}
              className={`rounded-md border px-3 py-2 ${activeTemplate === 'optout' ? 'border-black' : 'border-gray-200'}`}
            >
              Opt-out
            </button>
            <button
              onClick={() => setActiveTemplate('inquiry')}
              className={`rounded-md border px-3 py-2 ${activeTemplate === 'inquiry' ? 'border-black' : 'border-gray-200'}`}
            >
              Inquiry
            </button>
            <button
              onClick={() => setActiveTemplate('delete')}
              className={`rounded-md border px-3 py-2 ${activeTemplate === 'delete' ? 'border-black' : 'border-gray-200'}`}
            >
              Delete/Rectify
            </button>
          </div>
          <textarea
            readOnly
            className="h-32 w-full rounded-md border border-gray-200 p-3 text-sm"
            value={templateText}
          />
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={handleCopy} className="rounded-md bg-black px-4 py-2 text-white">
              Copy Text
            </button>
            <button onClick={handlePrint} className="rounded-md border border-gray-200 px-4 py-2">
              Print / Save PDF
            </button>
            {copied && <span className="text-xs text-green-600">Copied</span>}
          </div>
        </section>
      </div>
    </main>
  )
}
