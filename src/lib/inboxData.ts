import inboxDocuments from '@/lib/fixtures/inboxDocuments.json'
import { fetchInboxDocuments } from '@/lib/api/inboxApi'

export type DocumentRiskLevel = 'LOW' | 'MED' | 'HIGH'
export type DocumentType =
  | 'POLICY_UPDATE'
  | 'CONSENT_FORM'
  | 'DATA_REQUEST'
  | 'HIGH_RISK_REQUEST'

export type DocumentListItem = {
  id: string
  title: string
  entity_name: string
  doc_type: DocumentType
  received_at: string
  risk_level: DocumentRiskLevel
  summary_line: string
  verification_code: string
  verification_token: string
}

const mockEnabled = process.env.NEXT_PUBLIC_MOCK === 'true'

export const getInboxDocuments = async (): Promise<DocumentListItem[]> => {
  // Mock 모드가 활성화되어 있으면 로컬 데이터 사용
  if (mockEnabled) {
    return inboxDocuments as DocumentListItem[]
  }
  
  // 백엔드 API에서 데이터 가져오기
  try {
    return await fetchInboxDocuments()
  } catch (error) {
    console.error('Failed to fetch inbox documents from backend:', error)
    return []
  }
}

export const docTypeLabelMap: Record<DocumentType, string> = {
  POLICY_UPDATE: 'Policy Update',
  CONSENT_FORM: 'Consent Form',
  DATA_REQUEST: 'Data Request',
  HIGH_RISK_REQUEST: 'High Risk',
}
