import { backend } from './api/client'
import { Receipt } from './receiptTypes'

// Treat any case-insensitive "true" as enabling mock mode. Default is backend.
const mockEnabled = (process.env.NEXT_PUBLIC_MOCK || '').toLowerCase() === 'true'
const STORAGE_KEY = 'receiptos.receipts'

// ============================================================================
// Mock mode helpers (localStorage)
// ============================================================================

const readStorage = (): Receipt[] => {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as Receipt[]
  } catch {
    return []
  }
}

const writeStorage = (receipts: Receipt[]) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts))
}

// ============================================================================
// Public API
// ============================================================================

/** Return receipt list (mock-only; backend callers should use receiptClient). */
export const getReceipts = (): Receipt[] => {
  if (mockEnabled) return readStorage()
  return []
}

/** Fetch single receipt by id (mock first, then backend). */
export const getReceiptById = async (id: string): Promise<Receipt | null> => {
  if (mockEnabled) {
    const found = readStorage().find((item) => item.id === id)
    if (found) return found
    console.warn(`[receiptStorage] Receipt ${id} not found locally; falling back to backend.`)
  }

  try {
    const response = await backend.get(`/api/receipts/${id}`)
    const receipt = transformBackendReceiptToFrontendReceipt(response.data)
    return receipt
  } catch (error: any) {
    console.error(`Failed to fetch receipt ${id}:`, error)
    if (error?.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
    }
    return null
  }
}

/** Save receipt (mock only). */
export const saveReceipt = (receipt: Receipt): void => {
  if (!mockEnabled) return
  const receipts = readStorage()
  writeStorage([receipt, ...receipts])
}

/** Replace receipt list (mock only). */
export const replaceReceipts = (receipts: Receipt[]): void => {
  if (!mockEnabled) return
  writeStorage(receipts)
}

/** Delete a receipt by id (mock + backend). */
export const deleteReceipt = async (id: string): Promise<void> => {
  const removeFromLocal = () => {
    const receipts = readStorage().filter((item) => item.id !== id)
    writeStorage(receipts)
  }

  if (mockEnabled) {
    removeFromLocal()
  }

  try {
    await backend.delete(`/api/receipts/${id}`)
  } catch (error) {
    if (!mockEnabled) {
      console.error(`Failed to delete receipt ${id}:`, error)
      throw error
    }
    console.warn(`[receiptStorage] Backend delete failed in mock mode for ${id}:`, error)
  }
}

// ============================================================================
// Backend -> Frontend transformation
// ============================================================================

export function transformBackendReceiptToFrontendReceipt(backendReceipt: any): Receipt {
  const sevenLines = backendReceipt.seven_lines || {}
  const signals = backendReceipt.signals || []
  const fields = backendReceipt.fields || {}

  const docTypeMap: Record<string, string> = {
    consent: 'CONSENT',
    change: 'PRIVACY_CHANGE',
    marketing: 'CONSENT',
    third_party: 'CONSENT',
    unknown: 'NOTICE',
  }
  const docType = docTypeMap[backendReceipt.document_type] || 'NOTICE'

  const category = inferCategory(fields)
  const retentionDays = inferRetentionDays(fields)

  const dataItems = extractDataItems(fields)
  const requiredItems = backendReceipt.required_items || extractRequiredItems(fields)
  const optionalItems = backendReceipt.optional_items || extractOptionalItems(fields)
  const thirdPartyServices = extractThirdPartyServices(fields)
  const transfers = backendReceipt.transfers || extractTransfers(fields, dataItems)

  const overCollection =
    backendReceipt.over_collection || signals.some((s: any) => s.signal_id === 'over_collection_risk')
  const overCollectionReasons =
    backendReceipt.over_collection_reasons ||
    signals.filter((s: any) => s.signal_id === 'over_collection_risk').map((s: any) => s.title)

  const evidence = transformEvidence(fields, signals)

  return {
    id: backendReceipt.receipt_id,
    service_name: sevenLines.what || backendReceipt.document_type || 'Unknown Service',
    entity_name: sevenLines.who || 'Unknown Entity',
    doc_type: docType as any,
    received_at: backendReceipt.created_at,
    category: category as any,
    retention: sevenLines.when || 'Not specified',
    retention_days: retentionDays,
    revoke_path: sevenLines.how_to_revoke || null,
    third_party_services: thirdPartyServices,
    data_items: dataItems,
    required_items: requiredItems.length > 0 ? requiredItems : dataItems,
    optional_items: optionalItems,
    over_collection: overCollection,
    over_collection_reasons: overCollectionReasons || [],
    transfers: transfers,
    summary: sevenLines.risk_summary || sevenLines.what || 'No summary',
    evidence: evidence,
  }
}

function inferCategory(fields: any): string {
  const fieldKeys = Object.keys(fields).join(' ').toLowerCase()
  if (fieldKeys.includes('payment') || fieldKeys.includes('결제')) return 'PAYMENT'
  if (fieldKeys.includes('cloud') || fieldKeys.includes('클라우드')) return 'CLOUD'
  if (fieldKeys.includes('health') || fieldKeys.includes('건강')) return 'HEALTH'
  if (fieldKeys.includes('edu') || fieldKeys.includes('교육')) return 'EDU'
  if (fieldKeys.includes('marketing') || fieldKeys.includes('마케팅')) return 'MARKETING'
  return 'GENERAL'
}

function inferRetentionDays(fields: any): number {
  const retentionField = fields.retention || fields.retention_period || fields.보유기간
  if (!retentionField) return 0

  const value = retentionField.value
  if (typeof value === 'string') {
    const daysMatch = value.match(/(\d+)\s*일/)
    if (daysMatch) return parseInt(daysMatch[1])
    const monthsMatch = value.match(/(\d+)\s*개월/)
    if (monthsMatch) return parseInt(monthsMatch[1]) * 30
    const yearsMatch = value.match(/(\d+)\s*년/)
    if (yearsMatch) return parseInt(yearsMatch[1]) * 365
  }
  return 0
}

function extractDataItems(fields: any): string[] {
  const items: string[] = []
  const dataItemsField = fields.data_collected || fields.data_items || fields.수집항목
  if (dataItemsField) {
    const value = dataItemsField.value
    if (Array.isArray(value)) {
      items.push(...value)
    } else if (typeof value === 'string') {
      items.push(value)
    }
  }
  return items.length > 0 ? items : ['Unclassified']
}

function extractRequiredItems(fields: any): string[] {
  const items: string[] = []
  const field = fields.required_items || fields.필수항목
  if (field) {
    const value = field.value
    if (Array.isArray(value)) {
      items.push(...value)
    } else if (typeof value === 'string') {
      items.push(value)
    }
  }
  return items
}

function extractOptionalItems(fields: any): string[] {
  const items: string[] = []
  const field = fields.optional_items || fields.선택항목
  if (field) {
    const value = field.value
    if (Array.isArray(value)) {
      items.push(...value)
    } else if (typeof value === 'string') {
      items.push(value)
    }
  }
  return items
}

function extractThirdPartyServices(fields: any): string[] {
  const services: string[] = []
  const thirdPartyField = fields.third_party || fields['제3자제공']
  if (thirdPartyField) {
    const value = thirdPartyField.value
    if (Array.isArray(value)) {
      services.push(...value)
    } else if (typeof value === 'string') {
      services.push(value)
    }
  }
  const overseasField = fields.overseas_transfer || fields['국외이전']
  if (overseasField) {
    const value = overseasField.value
    const list = Array.isArray(value) ? value : value ? [value] : []
    list.forEach((v: string) => services.push(`(국외) ${v}`))
  }
  return services
}

function extractTransfers(
  fields: any,
  dataItems: string[],
): Array<{ type: string; destination: string; is_overseas: boolean; data_items: string[] }> {
  const transfers: Array<{ type: string; destination: string; is_overseas: boolean; data_items: string[] }> = []
  const pushTransfer = (field: any, type: string, is_overseas = false) => {
    if (!field) return
    const value = field.value
    const list = Array.isArray(value) ? value : value ? [value] : []
    list.forEach((dest: string) => {
      transfers.push({
        type,
        destination: dest,
        is_overseas,
        data_items: dataItems,
      })
    })
  }
  pushTransfer(fields.third_party || fields['제3자제공'], 'third_party', false)
  pushTransfer(fields.outsourcing || fields['위탁'], 'outsourcing', false)
  pushTransfer(fields.overseas_transfer || fields['국외이전'], 'overseas', true)
  pushTransfer(fields.data_transfers || fields['전송'], 'transfer', false)
  return transfers
}

function transformEvidence(
  fields: any,
  signals: any[],
): Array<{ field: string; quote: string; why: string }> {
  const evidence: Array<{ field: string; quote: string; why: string }> = []

  for (const [fieldName, fieldData] of Object.entries(fields)) {
    const field = fieldData as any
    if (field.evidence && field.evidence.length > 0) {
      field.evidence.forEach((ev: any) => {
        evidence.push({
          field: fieldName,
          quote: ev.quote || '',
          why: `Extracted from ${ev.location || 'document'}`,
        })
      })
    }
  }

  signals.forEach((signal) => {
    if (signal.evidence && signal.evidence.length > 0) {
      signal.evidence.forEach((ev: any) => {
        evidence.push({
          field: signal.signal_id || 'signal',
          quote: ev.quote || '',
          why: signal.description || signal.title,
        })
      })
    }
  })

  return evidence.length > 0
    ? evidence
    : [
        {
          field: 'summary',
          quote: 'No evidence extracted',
          why: 'No evidence found in document',
        },
      ]
}
