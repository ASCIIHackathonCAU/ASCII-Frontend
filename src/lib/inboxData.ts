import inboxDocuments from '@/lib/fixtures/inboxDocuments.json'

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

export const getInboxDocuments = (): DocumentListItem[] => {
  if (!mockEnabled) {
    return []
  }
  return inboxDocuments as DocumentListItem[]
}

export const docTypeLabelMap: Record<DocumentType, string> = {
  POLICY_UPDATE: 'Policy Update',
  CONSENT_FORM: 'Consent Form',
  DATA_REQUEST: 'Data Request',
  HIGH_RISK_REQUEST: 'High Risk',
}
