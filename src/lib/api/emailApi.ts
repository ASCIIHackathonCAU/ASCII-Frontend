import { backend } from './client'

export interface EmailAccount {
  id: string
  email: string
  provider: string
  is_active: boolean
  last_sync_at: string | null
  created_at: string
}

export interface ConsentEmail {
  id: string
  subject: string
  sender: string
  received_at: string
  category: string | null
  is_consent_related: boolean
  receipt_id: string | null
  analysis_json: any | null
}

export interface EmailSyncRequest {
  email_account_id: string
  max_emails?: number
}

export interface EmailSyncResponse {
  synced_count: number
  consent_emails_found: number
  emails: ConsentEmail[]
}

/**
 * 이메일 계정 연결
 */
export const createEmailAccount = async (
  email: string,
  provider: string,
  accessToken: string,
  refreshToken?: string
): Promise<EmailAccount> => {
  const response = await backend.post<EmailAccount>('/api/email/accounts', {
    email,
    provider,
    access_token: accessToken,
    refresh_token: refreshToken,
  })
  return response.data
}

/**
 * 이메일 계정 목록 조회
 */
export const listEmailAccounts = async (): Promise<EmailAccount[]> => {
  const response = await backend.get<EmailAccount[]>('/api/email/accounts')
  return response.data
}

/**
 * 이메일 동기화
 */
export const syncEmails = async (req: EmailSyncRequest): Promise<EmailSyncResponse> => {
  const response = await backend.post<EmailSyncResponse>('/api/email/sync', req)
  return response.data
}

/**
 * 동의 이메일 분석
 */
export const analyzeConsentEmail = async (emailId: string, forceReanalyze: boolean = false): Promise<ConsentEmail> => {
  const params = forceReanalyze ? { force_reanalyze: true } : {}
  const response = await backend.post<ConsentEmail>(`/api/email/consent-emails/${emailId}/analyze`, null, { params })
  return response.data
}

/**
 * 동의 이메일 목록 조회
 */
export const listConsentEmails = async (category?: string): Promise<ConsentEmail[]> => {
  const params = category ? { category } : {}
  const response = await backend.get<ConsentEmail[]>('/api/email/consent-emails', { params })
  return response.data
}

