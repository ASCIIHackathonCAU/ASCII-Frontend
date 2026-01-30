import { backend } from './api/client'
import { Receipt } from './receiptTypes'

// Treat any case-insensitive "true" as enabling mock mode. Default is backend.
const mockEnabled = (process.env.NEXT_PUBLIC_MOCK || '').toLowerCase() === 'true'
const STORAGE_KEY = 'receiptos.receipts'

// ============================================================================
// Mock 모드용 localStorage 함수들
// ============================================================================

const readStorage = (): Receipt[] => {
  if (typeof window === 'undefined') {
    return []
  }
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return []
  }
  try {
    return JSON.parse(raw) as Receipt[]
  } catch {
    return []
  }
}

const writeStorage = (receipts: Receipt[]) => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts))
}

// ============================================================================
// Public API
// ============================================================================

/**
 * 영수증 목록을 가져옵니다.
 */
export const getReceipts = (): Receipt[] => {
  if (mockEnabled) {
    return readStorage()
  }
  // 백엔드 모드에서는 receiptClient.listReceipts()를 사용해야 합니다.
  // 이 함수는 Mock 모드에서만 사용됩니다.
  return []
}

/**
 * ID로 영수증을 가져옵니다.
 */
export const getReceiptById = async (id: string): Promise<Receipt | null> => {
  // 1) Try mock/localStorage first (for offline demo mode)
  if (mockEnabled) {
    const found = readStorage().find((item) => item.id === id)
    if (found) return found
    // In mock mode but nothing in storage → fall back to backend so
    // dummy receipts seeded by the backend can still be viewed.
    console.warn(`[receiptStorage] Receipt ${id} not found in mock storage. Falling back to backend.`)
  }

  // 2) Backend fallback (default path)
  try {
    console.log('Fetching receipt from backend:', id)
    const response = await backend.get(`/api/receipts/${id}`)
    console.log('Receipt response:', response.data)
    
    // 백엔드 Receipt를 Frontend Receipt로 변환
    const receipt = transformBackendReceiptToFrontendReceipt(response.data)
    console.log('Transformed receipt:', receipt)
    return receipt
  } catch (error: any) {
    console.error(`Failed to fetch receipt ${id}:`, error)
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
    }
    return null
  }
}

/**
 * 영수증을 저장합니다.
 */
export const saveReceipt = (receipt: Receipt): void => {
  if (mockEnabled) {
    const receipts = readStorage()
    writeStorage([receipt, ...receipts])
  }
  // 백엔드 모드에서는 createReceiptFromText가 이미 저장하므로
  // 이 함수는 Mock 모드에서만 사용됩니다.
}

/**
 * 영수증 목록을 교체합니다.
 */
export const replaceReceipts = (receipts: Receipt[]): void => {
  if (mockEnabled) {
    writeStorage(receipts)
  }
  // 백엔드 모드에서는 사용되지 않습니다.
}

/**
 * 영수증을 삭제합니다.
 */
export const deleteReceipt = async (id: string): Promise<void> => {
  const removeFromLocal = () => {
    const receipts = readStorage()
    const filtered = receipts.filter((item) => item.id !== id)
    writeStorage(filtered)
  }

  // When mock mode is on we still attempt backend deletion in case
  // the receipt originated from the backend (dummy data, etc.).
  if (mockEnabled) {
    removeFromLocal()
  }

  try {
    await backend.delete(`/api/receipts/${id}`)
  } catch (error) {
    // If mock mode only and backend fails, we already removed locally.
    if (!mockEnabled) {
      console.error(`Failed to delete receipt ${id}:`, error)
      throw error
    }
    console.warn(`[receiptStorage] Backend delete failed in mock mode for ${id}:`, error)
  }
}

// ============================================================================
// 백엔드 Receipt를 Frontend Receipt로 변환
// ============================================================================

function transformBackendReceiptToFrontendReceipt(backendReceipt: any): Receipt {
  const sevenLines = backendReceipt.seven_lines || {}
  const signals = backendReceipt.signals || []
  
  // 위험도 계산
  const hasHighRisk = signals.some((s: any) => s.severity === 'high')
  const hasMediumRisk = signals.some((s: any) => s.severity === 'medium')
  
  // doc_type 매핑
  const docTypeMap: Record<string, string> = {
    consent: 'CONSENT',
    change: 'PRIVACY_CHANGE',
    marketing: 'CONSENT',
    third_party: 'CONSENT',
    unknown: 'NOTICE',
  }
  const docType = docTypeMap[backendReceipt.document_type] || 'NOTICE'

  // 카테고리 추정
  const category = inferCategory(backendReceipt.fields || {})

  // retention_days 계산
  const retentionDays = inferRetentionDays(backendReceipt.fields || {})

  // data_items 추출
  const dataItems = extractDataItems(backendReceipt.fields || {})

  // third_party_services 추출
  const thirdPartyServices = extractThirdPartyServices(backendReceipt.fields || {})

  // evidence 변환
  const evidence = transformEvidence(backendReceipt.fields || {}, signals)

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
  const retentionField = fields.retention_period || fields.보관기간
  if (!retentionField) return 0
  
  const value = retentionField.value
  if (typeof value === 'string') {
    const daysMatch = value.match(/(\d+)\s*일/)
    if (daysMatch) return parseInt(daysMatch[1])
    const yearsMatch = value.match(/(\d+)\s*년/)
    if (yearsMatch) return parseInt(yearsMatch[1]) * 365
  }
  return 0
}

function extractDataItems(fields: any): string[] {
  const items: string[] = []
  const dataItemsField = fields.data_items || fields.수집항목
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

function extractThirdPartyServices(fields: any): string[] {
  const services: string[] = []
  const thirdPartyField = fields.third_party || fields.제3자제공
  if (thirdPartyField) {
    const value = thirdPartyField.value
    if (Array.isArray(value)) {
      services.push(...value)
    } else if (typeof value === 'string') {
      services.push(value)
    }
  }
  return services
}

function transformEvidence(fields: any, signals: any[]): Array<{ field: string; quote: string; why: string }> {
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

  return evidence.length > 0 ? evidence : [
    {
      field: 'summary',
      quote: 'No evidence extracted',
      why: 'No evidence found in document',
    },
  ]
}
