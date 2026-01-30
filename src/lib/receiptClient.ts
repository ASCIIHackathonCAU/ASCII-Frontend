import samples from '@/receiptos-contracts/samples/receipts.json'
import { Receipt } from '@/lib/receiptTypes'
import { getReceipts, replaceReceipts, saveReceipt } from '@/lib/receiptStorage'

const mockEnabled = process.env.NEXT_PUBLIC_MOCK === 'true'

const createId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `rcpt-${Date.now()}`
}

export const listReceipts = () => {
  return getReceipts()
}

export const loadSampleReceipts = () => {
  if (!mockEnabled) {
    return []
  }
  const typedSamples = samples as Receipt[]
  replaceReceipts(typedSamples)
  return typedSamples
}

export const createReceiptFromText = (text: string): Receipt => {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const firstLine = lines[0] ?? 'Untitled Consent'
  const summaryLine = lines[1] ?? 'Summary generated from the provided text.'
  const excerpt = lines.slice(0, 3).join(' ')
  return {
    id: createId(),
    service_name: firstLine.replace('Service:', '').trim() || 'Unknown Service',
    entity_name: firstLine.replace('Service:', '').trim() || 'Unknown Entity',
    doc_type: 'NOTICE',
    received_at: new Date().toISOString(),
    category: 'GENERAL',
    retention: 'Needs review',
    retention_days: 0,
    revoke_path: null,
    third_party_services: [],
    data_items: ['Unclassified'],
    summary: summaryLine,
    evidence: [
      {
        field: 'summary',
        quote: excerpt || text.slice(0, 120),
        why: 'Excerpted from the top of the input text',
      },
    ],
  }
}

export const saveReceiptToStorage = (receipt: Receipt) => {
  saveReceipt(receipt)
  return receipt
}
