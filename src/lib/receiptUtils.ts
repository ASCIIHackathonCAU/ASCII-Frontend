import { Receipt } from '@/lib/receiptTypes'
import type { DocumentListItem, DocumentRiskLevel, DocumentType } from '@/lib/inboxData'

/**
 * Receipt 타입을 DocumentListItem으로 변환
 */
export function receiptToDocumentListItem(receipt: Receipt): DocumentListItem {
  // doc_type 매핑
  const docTypeMap: Record<string, DocumentType> = {
    CONSENT: 'CONSENT_FORM',
    PRIVACY_CHANGE: 'POLICY_UPDATE',
    POLICY_UPDATE: 'POLICY_UPDATE',
    NOTICE: 'POLICY_UPDATE',
  }
  const docType: DocumentType = docTypeMap[receipt.doc_type] || 'POLICY_UPDATE'

  // 위험도 계산
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
 * Receipt의 위험도 계산
 */
function calculateRiskLevel(receipt: Receipt): DocumentRiskLevel {
  // 고위험 조건 체크
  const hasHighRiskIndicators =
    receipt.data_items?.some((item) =>
      item.toLowerCase().includes('otp') ||
      item.toLowerCase().includes('계좌') ||
      item.toLowerCase().includes('주민번호')
    ) ||
    receipt.summary?.toLowerCase().includes('otp') ||
    receipt.summary?.toLowerCase().includes('계좌번호')

  if (hasHighRiskIndicators) {
    return 'HIGH'
  }

  // 중위험 조건 체크
  const hasMediumRiskIndicators =
    (receipt.retention_days && receipt.retention_days >= 365) ||
    (receipt.third_party_services && receipt.third_party_services.length > 0) ||
    !receipt.revoke_path ||
    receipt.revoke_path.includes('Needs') ||
    receipt.revoke_path.includes('명확화')

  if (hasMediumRiskIndicators) {
    return 'MED'
  }

  return 'LOW'
}

