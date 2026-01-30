import { backend } from './client'

export interface RoutingInfo {
  primary_channel: string
  destination: string
  instructions: string[]
  confidence: number
  source: string
}

export interface RequestScope {
  accounts?: string[]
  data_items?: string[]
  time_range?: string
}

export interface RevocationRequest {
  id: string
  receipt_id: string | null
  service_name: string
  entity_name: string
  entity_type: string | null
  request_type: string
  scope: RequestScope | null
  routing: RoutingInfo | null
  status: string
  created_at: string
  updated_at: string
}

export interface RevocationRequestCreate {
  receipt_id?: string
  service_name: string
  entity_name: string
  entity_type?: string
  request_type: 'DELETE' | 'WITHDRAW_CONSENT' | 'STOP_THIRD_PARTY' | 'LIMIT_PROCESSING'
  scope?: RequestScope
}

export interface RevocationLetter {
  id: string
  request_id: string
  subject: string
  body_text: string
  rendered_pdf_path: string | null
  created_at: string
}

export interface RevocationTimelineEvent {
  id: string
  request_id: string
  event: string
  note: string | null
  occurred_at: string
}

export interface RoutingPreset {
  id: string
  service_name: string
  entity_name: string
  entity_type: string | null
  primary_channel: string
  destination: string
  instructions: string[]
  confidence: number
  source: string
  created_at: string
  updated_at: string
}

/**
 * 철회 요청 생성
 */
export const createRevocationRequest = async (
  req: RevocationRequestCreate
): Promise<RevocationRequest> => {
  const response = await backend.post<RevocationRequest>('/api/revocation/requests', req)
  return response.data
}

/**
 * 철회 요청 목록 조회
 */
export const listRevocationRequests = async (status?: string): Promise<RevocationRequest[]> => {
  const params = status ? { status } : {}
  const response = await backend.get<RevocationRequest[]>('/api/revocation/requests', { params })
  return response.data
}

/**
 * 철회 요청 조회
 */
export const getRevocationRequest = async (requestId: string): Promise<RevocationRequest> => {
  const response = await backend.get<RevocationRequest>(`/api/revocation/requests/${requestId}`)
  return response.data
}

/**
 * 철회 요청서 생성
 */
export const generateRevocationLetter = async (
  requestId: string,
  templateType: string = 'standard'
): Promise<RevocationLetter> => {
  const response = await backend.post<RevocationLetter>(
    `/api/revocation/requests/${requestId}/generate-letter`,
    { request_id: requestId, template_type: templateType }
  )
  return response.data
}

/**
 * 철회 요청 전송
 */
export const sendRevocationRequest = async (requestId: string): Promise<RevocationRequest> => {
  const response = await backend.post<RevocationRequest>(
    `/api/revocation/requests/${requestId}/send`
  )
  return response.data
}

/**
 * 철회 요청 타임라인 조회
 */
export const getRevocationTimeline = async (
  requestId: string
): Promise<RevocationTimelineEvent[]> => {
  const response = await backend.get<RevocationTimelineEvent[]>(
    `/api/revocation/requests/${requestId}/timeline`
  )
  return response.data
}

/**
 * 라우팅 프리셋 목록 조회
 */
export const listRoutingPresets = async (): Promise<RoutingPreset[]> => {
  const response = await backend.get<RoutingPreset[]>('/api/revocation/routing/presets')
  return response.data
}

