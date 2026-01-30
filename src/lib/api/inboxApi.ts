import { backend } from './client'
import type { DocumentListItem, DocumentRiskLevel, DocumentType } from '@/lib/inboxData'

// 백엔드 Receipt 스키마를 DocumentListItem으로 변환
function receiptToDocumentListItem(receipt: any): DocumentListItem {
  // seven_lines에서 정보 추출
  const sevenLines = receipt.seven_lines || {}
  
  // signals에서 위험도 추출
  const signals = receipt.signals || []
  const riskLevel: DocumentRiskLevel = signals.some((s: any) => s.severity === 'high')
    ? 'HIGH'
    : signals.some((s: any) => s.severity === 'medium')
    ? 'MED'
    : 'LOW'

  // document_type을 DocumentType으로 매핑
  const docTypeMap: Record<string, DocumentType> = {
    consent: 'CONSENT_FORM',
    change: 'POLICY_UPDATE',
    marketing: 'CONSENT_FORM',
    third_party: 'CONSENT_FORM',
    unknown: 'POLICY_UPDATE',
  }
  const docType: DocumentType = docTypeMap[receipt.document_type] || 'POLICY_UPDATE'

  return {
    id: receipt.receipt_id || receipt.id,
    title: sevenLines.what || receipt.document_type || '문서',
    entity_name: sevenLines.who || '알 수 없음',
    doc_type: docType,
    received_at: receipt.created_at || new Date().toISOString(),
    risk_level: riskLevel,
    summary_line: sevenLines.risk_summary || sevenLines.what || '요약 정보 없음',
    verification_code: '', // 백엔드에서 제공하지 않음
    verification_token: '', // 백엔드에서 제공하지 않음
  }
}

export async function fetchInboxDocuments(): Promise<DocumentListItem[]> {
  try {
    const response = await backend.get('/api/receipts')
    const receipts = response.data || []
    return receipts.map(receiptToDocumentListItem)
  } catch (error) {
    console.error('Failed to fetch inbox documents:', error)
    return []
  }
}

export async function fetchInboxDocumentById(id: string): Promise<DocumentListItem | null> {
  try {
    const response = await backend.get(`/api/receipts/${id}`)
    return receiptToDocumentListItem(response.data)
  } catch (error) {
    console.error(`Failed to fetch inbox document ${id}:`, error)
    return null
  }
}

