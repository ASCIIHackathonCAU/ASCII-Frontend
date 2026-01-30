import { backend } from './api/client'
import { Receipt } from './receiptTypes'
import type { IngestResponse } from './api/types'

const mockEnabled = process.env.NEXT_PUBLIC_MOCK === 'true'

/**
 * 백엔드 API를 통해 영수증 목록을 가져옵니다.
 */
export const listReceipts = async (): Promise<Receipt[]> => {
  if (mockEnabled) {
    // Mock 모드에서는 localStorage 사용
    return getReceiptsFromStorage()
  }

  try {
    const response = await backend.get<any[]>('/api/receipts')
    const backendReceipts = response.data || []
    // 백엔드 Receipt 스키마를 Frontend Receipt 타입으로 변환
    return backendReceipts.map(transformBackendReceiptToFrontendReceipt)
  } catch (error) {
    console.error('Failed to fetch receipts from backend:', error)
    // 백엔드 연결 실패 시 빈 배열 반환
    return []
  }
}

/**
 * 백엔드 API를 통해 텍스트로부터 영수증을 생성합니다.
 */
export const createReceiptFromText = async (text: string, sourceType: string = 'other'): Promise<Receipt> => {
  if (mockEnabled) {
    // Mock 모드에서는 간단한 로직 사용
    return createMockReceipt(text)
  }

  try {
    const response = await backend.post<IngestResponse>('/api/ingest', {
      raw_text: text,
      source_type: sourceType,
    })
    // 백엔드 Receipt 스키마를 Frontend Receipt 타입으로 변환
    return transformBackendReceiptToFrontendReceipt(response.data.receipt)
  } catch (error: any) {
    console.error('Failed to create receipt from backend:', error)
    // 더 자세한 에러 정보 로깅
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
    } else if (error.request) {
      console.error('No response received. Backend may not be running.')
      throw new Error('백엔드 서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인하세요.')
    }
    throw error
  }
}

/**
 * 백엔드 API를 통해 영수증을 저장합니다.
 * (백엔드의 /api/ingest가 이미 저장하므로 별도 저장 불필요)
 */
export const saveReceiptToStorage = async (receipt: Receipt): Promise<Receipt> => {
  if (mockEnabled) {
    saveReceiptToLocalStorage(receipt)
    return receipt
  }

  // 백엔드에서는 이미 저장되어 있으므로 그대로 반환
  return receipt
}

/**
 * 샘플 영수증을 로드합니다 (Mock 모드 전용)
 */
export const loadSampleReceipts = (): Receipt[] => {
  if (!mockEnabled) {
    return []
  }
  // Mock 모드에서만 사용
  const samples = require('@/receiptos-contracts/samples/receipts.json')
  const typedSamples = samples as Receipt[]
  replaceReceiptsInStorage(typedSamples)
  return typedSamples
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

  // 카테고리 추정 (필드에서 추출)
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
  // fields에서 카테고리를 추론
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
    // "365일", "1년" 등의 문자열 파싱
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
  
  // fields에서 evidence 추출
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

  // signals에서 evidence 추출
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

// ============================================================================
// Mock 모드용 localStorage 함수들
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
