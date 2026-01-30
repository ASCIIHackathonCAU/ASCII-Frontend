import { backend } from './api/client'
import { Receipt } from './receiptTypes'
import type { IngestResponse } from './api/types'
import { transformBackendReceiptToFrontendReceipt } from './receiptStorage'

const mockEnabled = process.env.NEXT_PUBLIC_MOCK === 'true'

/**
 * Fetch receipt list from backend (or mock/localStorage in demo mode).
 */
export const listReceipts = async (): Promise<Receipt[]> => {
  if (mockEnabled) {
    return getReceiptsFromStorage()
  }

  try {
    const response = await backend.get<any[]>('/api/receipts')
    const backendReceipts = response.data || []
    return backendReceipts.map(transformBackendReceiptToFrontendReceipt)
  } catch (error) {
    console.error('Failed to fetch receipts from backend:', error)
    return []
  }
}

/**
 * Create receipt from free text via backend ingestion API.
 */
export const createReceiptFromText = async (
  text: string,
  sourceType: string = 'other',
): Promise<Receipt> => {
  if (mockEnabled) {
    return createMockReceipt(text)
  }

  try {
    const response = await backend.post<IngestResponse>('/api/ingest', {
      raw_text: text,
      source_type: sourceType,
    })
    return transformBackendReceiptToFrontendReceipt(response.data.receipt)
  } catch (error: any) {
    console.error('Failed to create receipt from backend:', error)
    if (error?.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
    } else if (error?.request) {
      throw new Error('백엔드에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.')
    }
    throw error
  }
}

/**
 * Save receipt to localStorage in mock mode.
 */
export const saveReceiptToStorage = async (receipt: Receipt): Promise<Receipt> => {
  if (mockEnabled) {
    saveReceiptToLocalStorage(receipt)
  }
  return receipt
}

/**
 * Load bundled sample receipts into localStorage (mock mode).
 */
export const loadSampleReceipts = (): Receipt[] => {
  if (!mockEnabled) return []
  const samples = require('@/receiptos-contracts/samples/receipts.json')
  const typedSamples = samples as Receipt[]
  replaceReceiptsInStorage(typedSamples)
  return typedSamples
}

// ============================================================================
// Mock/localStorage helpers
// ============================================================================

function getReceiptsFromStorage(): Receipt[] {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem('receiptos.receipts')
  if (!raw) return []
  try {
    return JSON.parse(raw) as Receipt[]
  } catch {
    return []
  }
}

function saveReceiptToLocalStorage(receipt: Receipt): void {
  if (typeof window === 'undefined') return
  const receipts = getReceiptsFromStorage()
  window.localStorage.setItem('receiptos.receipts', JSON.stringify([receipt, ...receipts]))
}

function replaceReceiptsInStorage(receipts: Receipt[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem('receiptos.receipts', JSON.stringify(receipts))
}

function createMockReceipt(text: string): Receipt {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const firstLine = lines[0] ?? 'Untitled Consent'
  const summaryLine = lines[1] ?? 'Summary generated from the provided text.'
  const excerpt = lines.slice(0, 3).join(' ')

  const createId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    return `rcpt-${Date.now()}`
  }

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
    required_items: ['Unclassified'],
    optional_items: [],
    over_collection: false,
    over_collection_reasons: [],
    transfers: [],
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

