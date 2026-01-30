import { Receipt } from '@/lib/receiptTypes'
import type { DocumentListItem, DocumentRiskLevel, DocumentType } from '@/lib/inboxData'

/**
 * Receipt 객체를 DocumentListItem으로 변환
 */
export function receiptToDocumentListItem(receipt: Receipt): DocumentListItem {
  const docTypeMap: Record<string, DocumentType> = {
    CONSENT: 'CONSENT_FORM',
    PRIVACY_CHANGE: 'POLICY_UPDATE',
    POLICY_UPDATE: 'POLICY_UPDATE',
    NOTICE: 'POLICY_UPDATE',
  }
  const docType: DocumentType = docTypeMap[receipt.doc_type] || 'POLICY_UPDATE'

  const riskLevel = calculateRiskLevel(receipt)

  return {
    id: receipt.id,
    title: receipt.service_name || '제목 없음',
    entity_name: receipt.entity_name || '알 수 없음',
    doc_type: docType,
    received_at: receipt.received_at || new Date().toISOString(),
    risk_level: riskLevel,
    summary_line: receipt.summary || '요약 정보 없음',
    verification_code: '',
    verification_token: '',
  }
}

/**
 * Receipt 기반 위험도 계산
 */
function calculateRiskLevel(receipt: Receipt): DocumentRiskLevel {
  const lowerSummary = (receipt.summary || '').toLowerCase()
  const sensitiveHit =
    receipt.over_collection ||
    receipt.data_items?.some((item) => {
      const lower = item.toLowerCase()
      return lower.includes('otp') || lower.includes('계좌') || lower.includes('주민') || lower.includes('비밀번호')
    }) ||
    lowerSummary.includes('otp') ||
    lowerSummary.includes('계좌')

  if (sensitiveHit) return 'HIGH'

  const mediumHit =
    (receipt.retention_days && receipt.retention_days >= 365) ||
    (receipt.third_party_services && receipt.third_party_services.length > 0) ||
    (receipt.transfers && receipt.transfers.some((t) => t.is_overseas)) ||
    !receipt.revoke_path ||
    (receipt.revoke_path && receipt.revoke_path.toLowerCase().includes('need'))

  return mediumHit ? 'MED' : 'LOW'
}

